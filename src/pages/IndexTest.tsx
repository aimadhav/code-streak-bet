import React from 'react';

const IndexTest = () => {
  console.log('IndexTest rendering');
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0D0D' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#00FF7F', fontSize: '3rem', marginBottom: '1rem' }}>
          ✅ App is Working!
        </h1>
        <p style={{ color: '#AAAAAA', fontSize: '1.25rem' }}>
          The app has loaded successfully
        </p>
      </div>
    </div>
  );
};

export default IndexTest;
