import React, { useEffect, useState } from 'react';
import './App.css';
import { createGame, GameState } from './game-engine';

const App: React.FC = () => {

  const [gameState, setGameState] = useState<null | GameState>(null);

  useEffect(() => {
    const game = createGame({ 
      cutter: { 
        left: 40, 
        width: 20,
        height: 5,
        top: 95
      }, 
      generator: { 
        maxItems: 10, 
        interval: 1000 
      },
      onChange: setGameState
    });

    document.onkeydown = (event) => {
      if(event.key === "a") game.setDirection('left');
      if(event.key === "d") game.setDirection('right');
    }

    return () => {
      game.stop();
    };
  }, []);

  return (
    <div className="App">
       {gameState && (
       <>
        <div style={{position: 'relative', width: '100vw', height: '80vh'}}>
          {gameState.items.map(item => <div key={item.id} style={{transition: 'top 0.25s', left: item.left + '%', top: item.top + '%', width: item.width + '%', height: '10%', display: 'inline-block', position: 'absolute', backgroundColor: item.isCut ? 'pink' : '#ffaa00'}}>{JSON.stringify(item)}</div>)}
          <div style={{ top: gameState.cutter.top + '%', width: gameState.cutter.width + '%', height: gameState.cutter.height + '%', position: 'absolute', left: gameState.cutter.left + '%', backgroundColor: 'blue'}}>x</div>
        </div>
        
        <div>Score: {gameState.items.filter(x => x.isCut).length}</div>
        <div>{gameState.direction}</div>
        <div>{gameState.cutter.left}</div>
        <div>{gameState.isFinished ? 'Finished' : 'Running'}</div>
        </>
      )
      }
    </div>
  );
}

export default App;
