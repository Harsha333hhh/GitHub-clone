import React from 'react';

// LanguageStatistics Component
// Displays programming language breakdown for a repository
// Shows language name, percentage, and colored bar visualization

const LanguageStatistics = ({ languages }) => {
  if (!languages || languages.length === 0) {
    return (
      <div style={{
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-subtle)',
        color: 'var(--fg-muted)',
        fontSize: '13px',
        textAlign: 'center'
      }}>
        No language data available
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--fg-default)'
      }}>
        Languages
      </div>

      {/* Language List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {languages.map((lang, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Language Dot */}
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: lang.color || '#858585',
              flexShrink: 0
            }}
            />

            {/* Language Name & Percentage */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1,
              fontSize: '12px'
            }}>
              <span style={{
                color: 'var(--fg-default)',
                fontWeight: 500
              }}>
                {lang.language}
              </span>
              <span style={{
                color: 'var(--fg-muted)',
                fontWeight: 400
              }}>
                {lang.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        display: 'flex',
        height: '6px',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        background: 'var(--bg-canvas)',
        gap: '0px'
      }}>
        {languages.map((lang, index) => (
          <div
            key={index}
            style={{
              flex: lang.percentage,
              background: lang.color || '#858585',
              height: '100%'
            }}
            title={`${lang.language}: ${lang.percentage.toFixed(1)}%`}
          />
        ))}
      </div>
    </div>
  );
};

export default LanguageStatistics;
