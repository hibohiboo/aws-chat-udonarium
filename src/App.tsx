import { useState } from 'react';
import useUdonariumChat from './hooks/useUdonariumChat';

function App() {
  const [count, setCount] = useState(0);
  const { rooms } = useUdonariumChat();
  return (
    <div className="App">
      <ul>
        {rooms.map((room) => (
          <li key={room.alias}>
            <span>{room.name}</span>
            <span>{room.numberOfEntrants}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
