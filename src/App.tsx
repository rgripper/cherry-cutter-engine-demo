import React, { useEffect, useState } from 'react';
import './App.css';
import { createGame, GameState } from './GameEngine';

const App: React.FC = () => {

  const [gameState, setGameState] = useState<undefined | GameState>(undefined);

  useEffect(() => createGame({ 
    cutter: { 
      left: 40, 
      width: 20 
    }, 
    generator: { 
      maxItems: 10, 
      interval: 1000 
    }, 
    controls: {
      subscribe: () => {},
      unsubscribe: () => {}
    },
    onChange: setGameState, 
  }), []);
  return (
    <div className="App">
      {JSON.stringify(gameState, undefined, '\n')}
    </div>
  );
}

export default App;
