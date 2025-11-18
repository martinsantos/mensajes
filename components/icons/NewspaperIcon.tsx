import React from 'react';
import Icon from './Icon';

const NewspaperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4" />
    <path d="M8 6h8" />
    <path d="M8 10h8" />
    <path d="M8 14h4" />
  </Icon>
);

export default NewspaperIcon;
