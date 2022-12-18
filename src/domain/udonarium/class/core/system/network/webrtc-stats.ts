export enum CandidateType {
  UNKNOWN = 'unknown',
  RELAY = 'relay',
  PRFLX = 'prflx',
  SRFLX = 'srflx',
  HOST = 'host',
}

export class WebRTCStats {
  candidateType: CandidateType = CandidateType.UNKNOWN;

  constructor(private peerConnection: RTCPeerConnection) {}

  async updateAsync() {
    let stats: RTCStatsReport | null = null;
    try {
      stats = await this.peerConnection.getStats();
    } catch (error) {
      console.warn(error);
    }

    if (stats == null) {
      this.candidateType = CandidateType.UNKNOWN;
      return;
    }

    const candidatePairs: any[] = [];
    const localCandidates: any[] = [];
    const remoteCandidates: any[] = [];

    const succeededLocalCandidateIds: any[] = [];
    const succeededRemoteCandidateIds: any[] = [];
    const usedLocalCandidates: any[] = [];
    const usedRemoteCandidates: any[] = [];

    stats.forEach((stat) => {
      if (stat.type.indexOf('candidate-pair') >= 0) {
        candidatePairs.push(stat);
      }
      if (stat.type.indexOf('local-candidate') >= 0) {
        localCandidates.push(stat);
      }
      if (stat.type.indexOf('remote-candidate') >= 0) {
        remoteCandidates.push(stat);
      }
    });

    candidatePairs.forEach((candidatePair) => {
      if (candidatePair.state === 'succeeded') {
        succeededLocalCandidateIds.push(candidatePair.localCandidateId);
        succeededRemoteCandidateIds.push(candidatePair.remoteCandidateId);
      }
    });

    localCandidates.forEach((candidate) => {
      if (succeededLocalCandidateIds.includes(candidate.id)) {
        usedLocalCandidates.push(candidate);
      }
    });

    remoteCandidates.forEach((candidate) => {
      if (succeededRemoteCandidateIds.includes(candidate.id)) {
        usedRemoteCandidates.push(candidate);
      }
    });

    let candidateType = CandidateType.UNKNOWN;
    const types: CandidateType[] = Object.values(CandidateType);
    usedLocalCandidates.concat(usedRemoteCandidates).forEach((candidate) => {
      const index = types.indexOf(candidate.candidateType);
      if (types.indexOf(candidateType) < index) candidateType = types[index];
    });
    this.candidateType = candidateType;
  }
}
