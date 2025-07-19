import ResizeObserver from 'resize-observer-polyfill';

// Torna o ResizeObserver disponível globalmente para os testes
global.ResizeObserver = ResizeObserver;