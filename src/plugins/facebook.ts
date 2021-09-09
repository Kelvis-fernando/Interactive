export const FACEBOOK_SCRIPT_ID = 'facebook-jssdk';
export const INIT_TIMEOUT = 3000;

type LocaleKey = 'en-us' | 'pt-br' | 'es';

interface State {
  isExternal: boolean;
  pending: Promise<any> | null;
  consumers: number;
}

export function initSdk(
  options: Record<string, any>,
  locale: LocaleKey = 'en-us',
): Promise<void> {
  const locales: Record<LocaleKey, any> = {
    'en-us': 'en_US',
    'pt-br': 'pt_BR',
    es: 'es_LA',
  };

  return new Promise((resolve, reject) => {
    window.fbAsyncInit = function () {
      window.FB.init(options);
      resolve(window.FB);
    };
    /* eslint-disable */
    ;(function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0]
      const fbjs = d.getElementById(id);
      if (fbjs) { fbjs.parentNode?.removeChild(fbjs) }
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = `https://connect.facebook.net/${locales[locale]}/sdk.js`
      js.onerror = error => { reject(error) }
      fjs.parentNode?.insertBefore(js, fjs)
    }(document, 'script', FACEBOOK_SCRIPT_ID))
    window.setTimeout(
      () =>
        reject(
          'window.fbAsyncInit timed out, see: https://developers.facebook.com/support/bugs/',
        ),
      INIT_TIMEOUT,
    );
  });
}

export function removeScript(): Promise<any> {
  return new Promise(resolve => {
    const script = document.getElementById(FACEBOOK_SCRIPT_ID);
    if (script) script.remove();
    window.setTimeout(resolve);
  });
}

export class Sdk {
  static state: State = Object.seal({
    isExternal: false,
    pending: null,
    consumers: 0,
  });

  static async _init(options: Record<string, any>, locale: LocaleKey = 'en-us'): Promise<any> {
    if (Sdk.state.isExternal) return window.FB;
    if (window.FB) {
      Sdk.state.isExternal = true;
      return window.FB;
    }
    if (Sdk.state.pending) return Sdk.state.pending;
    Sdk.state.pending = initSdk(options, locale);
    return Sdk.state.pending;
  }

  static reset(): void {
    Sdk.state.consumers = 0;
    Sdk.state.pending = null;
    Sdk.state.isExternal = false;
  }

  static subscribe(args: any): Promise<any> {
    Sdk.state.consumers += 1;
    return Sdk._init(args);
  }

  static async unsubscribe(): Promise<any> {
    Sdk.state.consumers--;
    if (Sdk.state.isExternal || Sdk.state.consumers) return;
    Sdk.reset();
    return removeScript();
  }

  static isConnected(status: string): boolean {
    return status === 'connected';
  }

  static isDisconnected(status: string): boolean {
    return !Sdk.isConnected(status);
  }

  static getLoginStatus(): Promise<any> {
    return new Promise(resolve => window.FB.getLoginStatus(resolve));
  }

  static login(options: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        return window.FB.login(resolve, options);
      } catch (error) {
        reject(error);
      }
    });
  }

  static logout(): Promise<any> {
    return new Promise(resolve => window.FB.logout(resolve));
  }
}
