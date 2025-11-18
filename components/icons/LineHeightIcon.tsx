
import React from 'react';
import Icon from './Icon';

const LineHeightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="M4 14h16M4 18h16M4 6h16M4 10h16" />
    </Icon>
);

export default LineHeightIcon;
