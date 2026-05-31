import React from 'react';

const paths = {
  menu: [
    ['path', { d: 'M4 6h16' }],
    ['path', { d: 'M4 12h16' }],
    ['path', { d: 'M4 18h16' }],
  ],
  search: [
    ['circle', { cx: '11', cy: '11', r: '7' }],
    ['path', { d: 'm20 20-3.5-3.5' }],
  ],
  home: [
    ['path', { d: 'm3 11 9-8 9 8' }],
    ['path', { d: 'M5 10v10h14V10' }],
    ['path', { d: 'M9 20v-6h6v6' }],
  ],
  user: [
    ['path', { d: 'M20 21a8 8 0 0 0-16 0' }],
    ['circle', { cx: '12', cy: '7', r: '4' }],
  ],
  users: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
    ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
    ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }],
  ],
  clipboard: [
    ['rect', { x: '8', y: '2', width: '8', height: '4', rx: '1' }],
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }],
    ['path', { d: 'm9 14 2 2 4-4' }],
  ],
  book: [
    ['path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }],
    ['path', { d: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z' }],
  ],
  wallet: [
    ['path', { d: 'M20 7H5a3 3 0 0 0 0 6h15v7H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h15z' }],
    ['path', { d: 'M16 13h4' }],
  ],
  help: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M9.1 9a3 3 0 1 1 5.8 1c-.6 1.4-2.9 1.8-2.9 4' }],
    ['path', { d: 'M12 18h.01' }],
  ],
  logout: [
    ['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }],
    ['path', { d: 'm16 17 5-5-5-5' }],
    ['path', { d: 'M21 12H9' }],
  ],
  plus: [
    ['path', { d: 'M12 5v14' }],
    ['path', { d: 'M5 12h14' }],
  ],
  package: [
    ['path', { d: 'm7.5 4.3 9 5.2' }],
    ['path', { d: 'M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z' }],
    ['path', { d: 'M3.3 7 12 12l8.7-5' }],
    ['path', { d: 'M12 22V12' }],
  ],
  file: [
    ['path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }],
    ['path', { d: 'M14 2v6h6' }],
  ],
  key: [
    ['circle', { cx: '7.5', cy: '15.5', r: '5.5' }],
    ['path', { d: 'm12 11 8-8' }],
    ['path', { d: 'm15 6 3 3' }],
    ['path', { d: 'm17 4 3 3' }],
  ],
  bag: [
    ['path', { d: 'M6 7h12l1 14H5z' }],
    ['path', { d: 'M9 7a3 3 0 0 1 6 0' }],
  ],
  laptop: [
    ['rect', { x: '4', y: '5', width: '16', height: '11', rx: '2' }],
    ['path', { d: 'M2 20h20' }],
  ],
  shirt: [
    ['path', { d: 'M20.4 7.5 16 3H8L3.6 7.5 7 11v9h10v-9z' }],
    ['path', { d: 'M8 3a4 4 0 0 0 8 0' }],
  ],
  glasses: [
    ['circle', { cx: '6.5', cy: '14.5', r: '3.5' }],
    ['circle', { cx: '17.5', cy: '14.5', r: '3.5' }],
    ['path', { d: 'M10 14.5h4' }],
    ['path', { d: 'M3 14.5V7' }],
    ['path', { d: 'M21 14.5V7' }],
  ],
  mapPin: [
    ['path', { d: 'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z' }],
    ['circle', { cx: '12', cy: '10', r: '3' }],
  ],
  calendar: [
    ['rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }],
    ['path', { d: 'M16 2v4' }],
    ['path', { d: 'M8 2v4' }],
    ['path', { d: 'M3 10h18' }],
  ],
  arrowRight: [
    ['path', { d: 'M5 12h14' }],
    ['path', { d: 'm12 5 7 7-7 7' }],
  ],
  arrowLeft: [
    ['path', { d: 'M19 12H5' }],
    ['path', { d: 'm12 19-7-7 7-7' }],
  ],
  check: [
    ['path', { d: 'm20 6-11 11-5-5' }],
  ],
  x: [
    ['path', { d: 'M18 6 6 18' }],
    ['path', { d: 'm6 6 12 12' }],
  ],
  edit: [
    ['path', { d: 'M12 20h9' }],
    ['path', { d: 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z' }],
  ],
  trash: [
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M8 6V4h8v2' }],
    ['path', { d: 'M19 6 18 20H6L5 6' }],
  ],
  upload: [
    ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }],
    ['path', { d: 'm17 8-5-5-5 5' }],
    ['path', { d: 'M12 3v12' }],
  ],
  camera: [
    ['path', { d: 'M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3z' }],
    ['circle', { cx: '12', cy: '13', r: '3' }],
  ],
  mail: [
    ['rect', { x: '3', y: '5', width: '18', height: '14', rx: '2' }],
    ['path', { d: 'm3 7 9 6 9-6' }],
  ],
  phone: [
    ['path', { d: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1z' }],
  ],
  chart: [
    ['path', { d: 'M3 3v18h18' }],
    ['path', { d: 'm19 9-5 5-4-4-3 3' }],
  ],
};

export default function Icon({ name, size = 20, strokeWidth = 2, className = '', title }) {
  const iconPaths = paths[name] || paths.package;

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {iconPaths.map(([Tag, props], index) => <Tag key={index} {...props} />)}
    </svg>
  );
}
