// Language detection utility - analyzes file extensions and content to detect programming languages
// Used for automatic language detection when files are uploaded or repository is created

const LANGUAGE_EXTENSIONS = {
  // Web Development
  'js': { language: 'JavaScript', color: '#f1e05a' },
  'jsx': { language: 'JavaScript', color: '#f1e05a' },
  'ts': { language: 'TypeScript', color: '#3178c6' },
  'tsx': { language: 'TypeScript', color: '#3178c6' },
  'css': { language: 'CSS', color: '#563d7c' },
  'scss': { language: 'SCSS', color: '#c6538c' },
  'sass': { language: 'Sass', color: '#c6538c' },
  'less': { language: 'Less', color: '#1d365d' },
  'html': { language: 'HTML', color: '#e34c26' },
  'htm': { language: 'HTML', color: '#e34c26' },
  'xml': { language: 'XML', color: '#0060ac' },
  'json': { language: 'JSON', color: '#292929' },
  'vue': { language: 'Vue', color: '#41b883' },
  'svelte': { language: 'Svelte', color: '#ff3e00' },
  'jsx': { language: 'JavaScript', color: '#f1e05a' },
  
  // Backend & Systems
  'py': { language: 'Python', color: '#3572A5' },
  'java': { language: 'Java', color: '#b07219' },
  'class': { language: 'Java', color: '#b07219' },
  'jar': { language: 'Java', color: '#b07219' },
  'cpp': { language: 'C++', color: '#f34b7d' },
  'cc': { language: 'C++', color: '#f34b7d' },
  'cxx': { language: 'C++', color: '#f34b7d' },
  'c': { language: 'C', color: '#555555' },
  'h': { language: 'C', color: '#555555' },
  'cs': { language: 'C#', color: '#239120' },
  'rb': { language: 'Ruby', color: '#701516' },
  'go': { language: 'Go', color: '#00ADD8' },
  'rs': { language: 'Rust', color: '#dea584' },
  'php': { language: 'PHP', color: '#777bb4' },
  'swift': { language: 'Swift', color: '#FA7343' },
  'kt': { language: 'Kotlin', color: '#7F52FF' },
  'gradle': { language: 'Kotlin', color: '#7F52FF' },
  'sh': { language: 'Shell', color: '#89e051' },
  'bash': { language: 'Shell', color: '#89e051' },
  'sql': { language: 'SQL', color: '#336791' },
  
  // Configuration & Data
  'yml': { language: 'YAML', color: '#cb171e' },
  'yaml': { language: 'YAML', color: '#cb171e' },
  'toml': { language: 'TOML', color: '#9c4221' },
  'ini': { language: 'INI', color: '#d4af37' },
  'env': { language: 'Env', color: '#c8c' },
  
  // Markup & Documentation
  'md': { language: 'Markdown', color: '#083fa1' },
  'markdown': { language: 'Markdown', color: '#083fa1' },
  'tex': { language: 'LaTeX', color: '#3D6117' },
  'rst': { language: 'ReStructuredText', color: '#24292e' },
  
  // Other
  'dockerfile': { language: 'Docker', color: '#2496ED' },
  'makefile': { language: 'Makefile', color: '#427819' },
  'gemfile': { language: 'Ruby', color: '#701516' },
  'package.json': { language: 'JSON', color: '#292929' },
};

/**
 * Detect language from file extension
 * @param {string} fileName - The filename to analyze
 * @returns {object} - {language, color}
 */
export const detectLanguageFromFile = (fileName) => {
  if (!fileName) return { language: 'Other', color: '#8b949e' };
  
  // Handle special case files
  const lowerName = fileName.toLowerCase();
  if (LANGUAGE_EXTENSIONS[lowerName]) {
    return LANGUAGE_EXTENSIONS[lowerName];
  }
  
  // Extract extension
  const parts = fileName.split('.');
  if (parts.length < 2) return { language: 'Other', color: '#8b949e' };
  
  const ext = parts[parts.length - 1].toLowerCase();
  return LANGUAGE_EXTENSIONS[ext] || { language: 'Other', color: '#8b949e' };
};

/**
 * Calculate language statistics from an array of files
 * @param {array} files - Array of file objects with fileName property
 * @returns {array} - Sorted array of {language, percentage, color}
 */
export const calculateLanguageStats = (files) => {
  if (!files || files.length === 0) return [];
  
  const stats = {};
  
  files.forEach(file => {
    const { language, color } = detectLanguageFromFile(file.fileName || file.name);
    if (language === 'Other' && !stats['Other']) return; // Skip 'Other' category
    
    if (!stats[language]) {
      stats[language] = { count: 0, color };
    }
    stats[language].count++;
  });
  
  // Remove 'Other' if no real languages found
  delete stats['Other'];
  
  if (Object.keys(stats).length === 0) {
    return [{ language: 'Other', percentage: 100, color: '#8b949e' }];
  }
  
  // Convert to percentage and sort by percentage (descending)
  const total = files.length;
  const result = Object.entries(stats)
    .map(([language, data]) => ({
      language,
      percentage: Math.round((data.count / total) * 100),
      color: data.color
    }))
    .sort((a, b) => b.percentage - a.percentage);
  
  // Ensure percentages add up to 100
  let totalPercent = result.reduce((sum, item) => sum + item.percentage, 0);
  if (totalPercent !== 100 && result.length > 0) {
    result[0].percentage += (100 - totalPercent);
  }
  
  return result;
};

/**
 * Get primary language (most used) from stats array
 * @param {array} stats - Language statistics array
 * @returns {string} - Primary language
 */
export const getPrimaryLanguage = (stats) => {
  if (!stats || stats.length === 0) return 'JavaScript';
  return stats[0].language;
};
