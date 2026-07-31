import i18next from 'i18next';

const Events = {
    InstallPackage: 1,
    NavigateDirectory: 2,
    Error: 3,
    InstallationStatus: 4,
    DeleteConfiguration: 5,
    ConnectToTV: 6,
    InstallFile: 7
};

class Client {
    constructor(context) {
        this.context = context;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.connect();
    }

    connect() {
        this.socket = new WebSocket('ws://localhost:8091');
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    }

    onOpen() {
        this.retryCount = 0;
    }

    onError() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => this.connect(), 2000);
        } else {
            location.reload();
        }
    }

    onClose() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => this.connect(), 2000);
        }
    }

    onMessage(event) {
        var data;
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            return;
        }
        const { type, payload } = data;

        switch (type) {
            case Events.InstallPackage: {
                // Handle package installation statuses
                const requiresResigning = payload.response === 2;
                if (requiresResigning) {
                    this.context.dispatch({
                        type: 'SET_QR_CODE',
                        payload: true
                    });
                } else if (payload.response === 0) {
                    var resultStr = payload.result ? String(payload.result) : '';
                    var installFailedLine = resultStr.split('\n').find(function(line) { return line.indexOf('install failed') !== -1; });
                    if (installFailedLine) {
                        this.context.dispatch({
                            type: 'SET_ERROR',
                            payload: {
                                message: i18next.t('installStatus.installFailed', { line: installFailedLine }),
                                disappear: false
                            }
                        });

                        if (installFailedLine.indexOf('Check certificate error') !== -1) {
                            this.send({
                                type: Events.DeleteConfiguration
                            });
                        }
                    }
                } else {
                    this.context.dispatch({
                        type: 'SET_QR_CODE',
                        payload: false
                    });
                }
                break;
            }

            case Events.NavigateDirectory: {
                // Handle directory navigation
                this.context.dispatch({
                    type: 'SET_DIRECTORY',
                    payload: payload
                });
                break;
            }

            case Events.Error: {
                // Handle errors
                this.context.dispatch({
                    type: 'SET_ERROR',
                    payload: {
                        message: i18next.t(payload),
                        disappear: false
                    }
                });
                break;
            }

            case Events.InstallationStatus: {
                // Handle installation status updates
                this.context.dispatch({
                    type: 'SET_STATE',
                    payload: payload
                });
                break;
            }

            case Events.ConnectToTV: {
                // Handle connection to the TV
                this.context.dispatch({
                    type: 'SET_CONNECTED_TO_TV',
                    payload: payload && payload.success
                });
                
                if (payload && !payload.success) {
                    this.context.dispatch({
                        type: 'SET_ERROR',
                        payload: {
                            message: payload.error || 'Connection failed',
                            disappear: false
                        }
                    });
                }
                break;
            }
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
}

export { Events };
export default Client;