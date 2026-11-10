import { resolveApiBaseUrl } from './api';

describe('resolveApiBaseUrl', () => {
  it('prioriza EXPO_PUBLIC_API_URL y normaliza la barra final', () => {
    expect(
      resolveApiBaseUrl({
        explicitUrl: ' https://api.agrodoc.com/api/v1/ ',
        hostUri: '192.168.1.20:8081',
        isDev: true,
      }),
    ).toBe('https://api.agrodoc.com/api/v1');
  });

  it('en desarrollo usa la IP de Metro con el puerto del backend', () => {
    expect(
      resolveApiBaseUrl({ explicitUrl: null, hostUri: '192.168.1.20:8081', isDev: true }),
    ).toBe('http://192.168.1.20:8000/api/v1');
  });

  it('en desarrollo acepta localhost para simuladores', () => {
    expect(
      resolveApiBaseUrl({ explicitUrl: null, hostUri: 'localhost:8081', isDev: true }),
    ).toBe('http://localhost:8000/api/v1');
  });

  it('en desarrollo soporta un host IPv6 de Metro', () => {
    expect(
      resolveApiBaseUrl({ explicitUrl: null, hostUri: '[fe80::1]:8081', isDev: true }),
    ).toBe('http://[fe80::1]:8000/api/v1');
  });

  it('ignora el host de túnel de Metro y avisa', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      resolveApiBaseUrl({ explicitUrl: null, hostUri: 'abc-8081.exp.direct:80', isDev: true }),
    ).toBe('http://localhost:8000/api/v1');

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('EXPO_PUBLIC_API_URL'));
    warn.mockRestore();
  });

  it('sin hostUri cae a localhost en desarrollo', () => {
    expect(
      resolveApiBaseUrl({ explicitUrl: null, hostUri: null, isDev: true }),
    ).toBe('http://localhost:8000/api/v1');
  });

  it('exige EXPO_PUBLIC_API_URL en producción', () => {
    expect(() =>
      resolveApiBaseUrl({ explicitUrl: null, hostUri: null, isDev: false }),
    ).toThrow(/EXPO_PUBLIC_API_URL/);
  });

  it('usa EXPO_PUBLIC_API_URL en producción', () => {
    expect(
      resolveApiBaseUrl({
        explicitUrl: 'https://api.agrodoc.com/api/v1',
        hostUri: null,
        isDev: false,
      }),
    ).toBe('https://api.agrodoc.com/api/v1');
  });
});
