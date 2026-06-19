declare module 'xmlrpc' {
  type XmlRpcCallback = (error: unknown, value: unknown) => void;

  export type XmlRpcClient = {
    methodCall(method: string, params: unknown[], callback: XmlRpcCallback): void;
  };

  export function createClient(options: { url: string; cookies?: boolean }): XmlRpcClient;
  export function createSecureClient(options: { url: string; cookies?: boolean }): XmlRpcClient;
}
