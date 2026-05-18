import React from 'react';

export const LogoMark = ({ className = '', size = 32, ...props }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 155" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* spine */}
      <rect x="0"  y="0"   width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="0"  y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="0"  y="44"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="0"  y="66"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="0"  y="88"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="0"  y="110" width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="0"  y="132" width="18" height="18" rx="3" fill="#c3f400"/>
      {/* top arm */}
      <rect x="22" y="0"   width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="44" y="0"   width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="66" y="0"   width="18" height="18" rx="3" fill="#c3f400"/>
      {/* upper bowl */}
      <rect x="22" y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="44" y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="66" y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="88" y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="66" y="44"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="88" y="44"  width="18" height="18" rx="3" fill="#c3f400"/>
      {/* close arm */}
      <rect x="22" y="66"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="44" y="66"  width="18" height="18" rx="3" fill="#c3f400"/>
      <rect x="66" y="66"  width="18" height="18" rx="3" fill="#c3f400"/>
      {/* ghost trail */}
      <rect x="22" y="88"  width="18" height="18" rx="3" fill="#c3f400" opacity="0.22"/>
      <rect x="44" y="88"  width="18" height="18" rx="3" fill="#c3f400" opacity="0.11"/>
      <rect x="22" y="110" width="18" height="18" rx="3" fill="#c3f400" opacity="0.08"/>
    </svg>
  );
};

export const Logo = ({ className = '', height = 40, showText = true, ...props }) => {
  const width = (height * 240) / 60;
  
  if (!showText) {
    return <LogoMark size={height} className={className} {...props} />;
  }

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 240 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* P mark — pixel grid */}
      <g transform="translate(0, 4) scale(0.38)">
        {/* spine */}
        <rect x="0"  y="0"   width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="0"  y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="0"  y="44"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="0"  y="66"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="0"  y="88"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="0"  y="110" width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="0"  y="132" width="18" height="18" rx="3" fill="#c3f400"/>
        {/* top arm */}
        <rect x="22" y="0"   width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="44" y="0"   width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="66" y="0"   width="18" height="18" rx="3" fill="#c3f400"/>
        {/* upper bowl */}
        <rect x="22" y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="44" y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="66" y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="88" y="22"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="66" y="44"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="88" y="44"  width="18" height="18" rx="3" fill="#c3f400"/>
        {/* close arm */}
        <rect x="22" y="66"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="44" y="66"  width="18" height="18" rx="3" fill="#c3f400"/>
        <rect x="66" y="66"  width="18" height="18" rx="3" fill="#c3f400"/>
        {/* ghost trail */}
        <rect x="22" y="88"  width="18" height="18" rx="3" fill="#c3f400" opacity="0.22"/>
        <rect x="44" y="88"  width="18" height="18" rx="3" fill="#c3f400" opacity="0.11"/>
        <rect x="22" y="110" width="18" height="18" rx="3" fill="#c3f400" opacity="0.08"/>
      </g>
      {/* wordmark */}
      <text x="58" y="40" fontFamily="'Space Grotesk', 'Arial Black', sans-serif" fontWeight="800" fontSize="32" letterSpacing="-1.5" fill="#ffffff">Pixora</text>
      {/* lime dot over the i */}
      <rect x="83" y="11" width="6" height="6" rx="1.5" fill="#c3f400"/>
    </svg>
  );
};

export default Logo;
