Object.defineProperty(console, 'error', {
    value: jest.fn(),
    writable: true,
})