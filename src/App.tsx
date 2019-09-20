import React, { useEffect, useState } from 'react';
import './App.css';
import { createGame, GameState } from './game-engine';

const App: React.FC = () => {

  const [gameState, setGameState] = useState<null | GameState>(null);

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
       {gameState && (
       <>
        <div style={{position: 'relative', width: '100vw', height: '80vh'}}>
          {gameState.items.map(item => <div key={item.id} style={{transition: 'top 0.25s', left: item.left + '%', top: item.top + '%', width: item.width + '%', height: '10%', display: 'inline-block', position: 'absolute', backgroundColor: '#ffff00'}}>{item.id}</div>)}
        </div>
        <div>{gameState.isFinished ? 'Finished' : 'Running'}</div>
        </>
      )
      }
    </div>
  );
}

export default App;
