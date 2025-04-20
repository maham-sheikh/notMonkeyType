import React from 'react';
import TestArea from './../features/typing/TestArea'
const ExternalMonitor = ({ testText, charClasses, onInput, userInput, inputRef, testStarted }) => {
  return (
    <div className="externalMonitor">
      <div className="screen">
        <TestArea testText={testText} charClasses={charClasses} />
        <input
          type="text"
          onChange={onInput}
          value={userInput}
          ref={inputRef}
          disabled={!testStarted}
          style={{ opacity: 0, position: 'absolute', left: '-9999px' }}
          autoFocus
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

export default ExternalMonitor;
