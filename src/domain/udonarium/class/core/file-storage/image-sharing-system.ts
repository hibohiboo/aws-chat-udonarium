import { EVENT_NAME } from '@/domain/udonarium/event/constants';
import { EventSystem, Network } from '../system';
import { UUID } from '../system/util/uuid';
import { BufferSharingTask } from './buffer-sharing-task';
import { FileReaderUtil } from './file-reader-util';
import { ImageContext, ImageFile, ImageState } from './image-file';
import { CatalogItem, ImageStorage } from './image-storage';
import { MimeType } from './mime-type';

export class ImageSharingSystem {
  private static _instance: ImageSharingSystem;
  static get instance(): ImageSharingSystem {
    if (!ImageSharingSystem._instance) ImageSharingSystem._instance = new ImageSharingSystem();
    return ImageSharingSystem._instance;
  }

  private sendTaskMap: Map<string, BufferSharingTask<ImageContext[]>> = new Map();
  private receiveTaskMap: Map<string, BufferSharingTask<ImageContext[]>> = new Map();
  private maxSendTask: number = 2;
  private maxReceiveTask: number = 4;

  private constructor() {
    console.log('FileSharingSystem ready...');
  }

  initialize() {
    EventSystem.register(this)
      .on(EVENT_NAME.CONNECT_PEER, 1, (event) => {
        if (!event.isSendFromSelf) return;
        console.log('CONNECT_PEER ImageStorageService !!!', event.data.peerId);
        ImageStorage.instance.synchronize();
      })
      .on(EVENT_NAME.XML_LOADED, (event) => {
        convertUrlImage(event.data.xmlElement);
      })
      .on(EVENT_NAME.SYNCHRONIZE_FILE_LIST, (event) => {
        if (event.isSendFromSelf) return;
        console.log('SYNCHRONIZE_FILE_LIST ImageStorageService ' + event.sendFrom);

        const otherCatalog: CatalogItem[] = event.data;
        const request: CatalogItem[] = [];

        for (const item of otherCatalog) {
          let image: ImageFile | null = ImageStorage.instance.get(item.identifier);
          if (image === null) {
            image = ImageFile.createEmpty(item.identifier);
            ImageStorage.instance.add(image);
          }
          if (image.state < ImageState.COMPLETE && !this.receiveTaskMap.has(item.identifier)) {
            request.push({ identifier: item.identifier, state: image.state });
          }
        }

        // Peer切断時などのエッジケースに対応する
        if (
          request.length < 1 &&
          !this.hasActiveTask() &&
          otherCatalog.length < ImageStorage.instance.getCatalog().length
        ) {
          ImageStorage.instance.synchronize(event.sendFrom);
        }

        if (request.length < 1 || this.isLimitReceiveTask()) {
          return;
        }
        this.request(request, event.sendFrom);
      })
      .on(EVENT_NAME.REQUEST_FILE_RESOURE, async (event) => {
        if (event.isSendFromSelf) return;

        const request: CatalogItem[] = event.data.identifiers;
        const randomRequest: CatalogItem[] = [];

        for (const item of request) {
          const image: ImageFile | null = ImageStorage.instance.get(item.identifier);
          if (image && item.state < image.state)
            randomRequest.push({ identifier: item.identifier, state: item.state });
        }

        if (
          this.isLimitSendTask() === false &&
          0 < randomRequest.length &&
          !this.existsSendTask(event.data.receiver)
        ) {
          // 送信
          const updateImages: ImageContext[] = this.makeSendUpdateImages(randomRequest);
          console.log(
            'REQUEST_FILE_RESOURE ImageStorageService Send!!! ' +
              event.data.receiver +
              ' -> ' +
              updateImages.length
          );
          this.startSendTask(updateImages, event.data.receiver);
        } else {
          // 中継
          const candidatePeers: string[] = event.data.candidatePeers;
          const index = candidatePeers.indexOf(Network.peerId);
          if (-1 < index) candidatePeers.splice(index, 1);

          for (const peerId of candidatePeers) {
            console.log(
              'REQUEST_FILE_RESOURE ImageStorageService Relay!!! ' +
                peerId +
                ' -> ' +
                event.data.identifiers
            );
            EventSystem.call(event, peerId);
            return;
          }
          console.log(
            'REQUEST_FILE_RESOURE ImageStorageService あぶれた...' + event.data.receiver,
            randomRequest.length
          );
        }
      })
      .on(EVENT_NAME.UPDATE_FILE_RESOURE, 1000, (event) => {
        const updateImages: ImageContext[] = event.data.updateImages;
        console.log(
          'UPDATE_FILE_RESOURE ImageStorageService ' + event.sendFrom + ' -> ',
          updateImages
        );
        for (const context of updateImages) {
          if (context.blob) context.blob = new Blob([context.blob], { type: context.type });
          if (context.thumbnail.blob)
            context.thumbnail.blob = new Blob([context.thumbnail.blob], {
              type: context.thumbnail.type,
            });
          ImageStorage.instance.add(context);
        }
      })
      .on(EVENT_NAME.START_FILE_TRANSMISSION, (event) => {
        console.log('START_FILE_TRANSMISSION ' + event.data.taskIdentifier);
        const identifier = event.data.taskIdentifier;
        const image: ImageFile | null = ImageStorage.instance.get(identifier);
        if (this.receiveTaskMap.has(identifier) || (image && ImageState.COMPLETE <= image.state)) {
          console.warn('CANCEL_TASK_ ' + identifier);
          EventSystem.call(EVENT_NAME.CANCEL_TASK_ + identifier, null, event.sendFrom);
        } else {
          this.startReceiveTask(identifier);
        }
      });
  }

  private destroy() {
    EventSystem.unregister(this);
  }

  private async startSendTask(updateImages: ImageContext[], sendTo: string) {
    const identifier = updateImages.length === 1 ? updateImages[0].identifier : UUID.generateUuid();
    const task = BufferSharingTask.createSendTask<ImageContext[]>(identifier, sendTo);
    this.sendTaskMap.set(task.identifier, task);
    EventSystem.call(EVENT_NAME.START_FILE_TRANSMISSION, { taskIdentifier: identifier }, sendTo);

    /* hotfix issue #1 */
    for (const context of updateImages) {
      if (context.thumbnail.blob) {
        context.thumbnail.blob = <any>(
          await FileReaderUtil.readAsArrayBufferAsync(context.thumbnail.blob)
        );
      } else if (context.blob) {
        context.blob = <any>await FileReaderUtil.readAsArrayBufferAsync(context.blob);
      }
    }
    /* */

    task.onfinish = (task, data) => {
      this.stopSendTask(task.identifier);
      ImageStorage.instance.synchronize();
    };

    task.start(updateImages);
  }

  private startReceiveTask(identifier: string) {
    const task = BufferSharingTask.createReceiveTask<ImageContext[]>(identifier);
    this.receiveTaskMap.set(identifier, task);
    task.onfinish = (task, data) => {
      this.stopReceiveTask(task.identifier);
      if (data)
        EventSystem.trigger('UPDATE_FILE_RESOURE', {
          identifier: task.identifier,
          updateImages: data,
        });
      ImageStorage.instance.synchronize();
    };

    task.start();
    console.log('startReceiveTask => ', this.receiveTaskMap.size);
  }

  private stopSendTask(identifier: string) {
    const task = this.sendTaskMap.get(identifier);
    if (task) {
      task.cancel();
    }
    this.sendTaskMap.delete(identifier);

    console.log('stopSendTask => ', this.sendTaskMap.size);
  }

  private stopReceiveTask(identifier: string) {
    const task = this.receiveTaskMap.get(identifier);
    if (task) {
      task.cancel();
    }
    this.receiveTaskMap.delete(identifier);

    console.log('stopReceiveTask => ', this.receiveTaskMap.size);
  }

  private request(request: CatalogItem[], peerId: string) {
    console.log('requestFile() ' + peerId);
    const peerIds = Network.peerIds;
    peerIds.splice(peerIds.indexOf(Network.peerId), 1);
    EventSystem.call(
      EVENT_NAME.REQUEST_FILE_RESOURE,
      { identifiers: request, receiver: Network.peerId, candidatePeers: peerIds },
      peerId
    );
  }

  private makeSendUpdateImages(
    catalog: CatalogItem[],
    maxSize: number = 1024 * 1024 * 0.5
  ): ImageContext[] {
    const updateImages: ImageContext[] = [];
    let byteSize: number = 0;

    // Fisher-Yates
    for (let i = catalog.length - 1; 0 <= i; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [catalog[i], catalog[rand]] = [catalog[rand], catalog[i]];
    }

    catalog.sort((a, b) => {
      if (a.state < b.state) return -1;
      if (a.state > b.state) return 1;
      return 0;
    });

    for (let i = 0; i < catalog.length; i++) {
      const item: { identifier: string; state: number } = catalog[i];
      const image: ImageFile | null = ImageStorage.instance.get(item.identifier);
      if (image == null) continue;
      const context: ImageContext = {
        identifier: image.identifier,
        name: image.name,
        type: '',
        blob: null,
        url: null,
        thumbnail: { type: '', blob: null, url: null },
      };

      if (image.state === ImageState.URL) {
        context.url = image.url;
      } else if (item.state === ImageState.NULL) {
        context.thumbnail.blob = image.thumbnail.blob; //
        context.thumbnail.type = image.thumbnail.type;
      } else if (image.blob != null) {
        context.blob = image.blob; //
        context.type = image.blob.type;
      }

      const size = context.blob
        ? context.blob.size
        : context.thumbnail.blob
        ? context.thumbnail.blob.size
        : 100;

      updateImages.push(context);
      byteSize += size;
      if (maxSize < byteSize) break;
    }
    return updateImages;
  }

  private hasActiveTask(): boolean {
    return 0 < this.sendTaskMap.size || 0 < this.receiveTaskMap.size;
  }

  private isLimitSendTask(): boolean {
    return this.maxSendTask <= this.sendTaskMap.size;
  }

  private isLimitReceiveTask(): boolean {
    return this.maxReceiveTask <= this.receiveTaskMap.size;
  }

  private existsSendTask(peerId: string): boolean {
    for (const task of this.sendTaskMap.values()) {
      if (task && task.sendTo === peerId) return true;
    }
    return false;
  }
}

function convertUrlImage(xmlElement: Element) {
  const urls: string[] = [];

  let imageElements = xmlElement.querySelectorAll('*[type="image"]');
  for (let i = 0; i < imageElements.length; i++) {
    const url = imageElements[i].innerHTML;
    if (!ImageStorage.instance.get(url) && 0 < MimeType.type(url).length) {
      urls.push(url);
    }
  }

  imageElements = xmlElement.querySelectorAll('*[imageIdentifier]');
  for (let i = 0; i < imageElements.length; i++) {
    const url = imageElements[i].getAttribute('imageIdentifier');
    if (url && !ImageStorage.instance.get(url) && 0 < MimeType.type(url).length) {
      urls.push(url);
    }
  }
  for (const url of urls) {
    ImageStorage.instance.add(url);
  }
}
