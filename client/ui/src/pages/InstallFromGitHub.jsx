import { useState, useContext, useRef, useEffect } from 'preact/hooks';
import { GlobalStateContext } from '../components/ClientContext.jsx';
import { useLocation } from 'preact-iso';
import { setFocus } from '@noriginmedia/norigin-spatial-navigation';
import { Events } from '../components/WebSocketClient.js';

import Item from "../components/Item.jsx";

export default function InstallFromGitHub() {
    const [name, setName] = useState('');
    const [isInstalling, setIsInstalling] = useState(false);
    const [error, setError] = useState('');
    const loc = useLocation();
    const { state } = useContext(GlobalStateContext);
    const ref = useRef(null);

    useEffect(() => {
        ref.current.focus();
    }, [ref]);

    const handleInstall = () => {
        if (!name.trim()) {
            setError('Please enter a repository name');
            return;
        }

        if (!state.client) {
            setError('Service not connected. Please refresh the page.');
            return;
        }

        if (!state.client.socket || state.client.socket.readyState !== WebSocket.OPEN) {
            setError('WebSocket not connected. Please refresh the page.');
            return;
        }

        setIsInstalling(true);
        setError('');

        var trimmedName = name.trim();
        console.log('Installing from GitHub:', trimmedName);
        state.client.send({
            type: Events.InstallPackage,
            payload: {
                url: trimmedName
            }
        });

        // Wait a moment before navigating to show installation started
        setTimeout(() => {
            loc.route('/ui/dist/index.html');
            setFocus('sn:focusable-item-1');
        }, 500);
    };

    return (
        <div className="relative isolate lg:px-8">
            <div className="mx-auto flex flex-wrap justify-center gap-4 top-4 relative">
                <Item>
                    <input
                        type="text"
                        ref={ref}
                        value={name}
                        className="w-full p-2 rounded-lg bg-gray-800 text-gray-200"
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        onKeyDown={(e) => {
                            if (e.keyCode === 13 || e.keyCode === 65376) {
                                handleInstall();
                            }
                        }}
                        placeholder="dskja/TizenBrew-Twitch or dskja/TizenBrew"
                        disabled={isInstalling}
                    />
                </Item>
                <Item onClick={handleInstall} disabled={isInstalling}>
                    <h3 className='text-indigo-400 text-base/7 font-semibold'>
                        {isInstalling ? 'Installing...' : 'Install'}
                    </h3>
                </Item>
            </div>
            {error && (
                <div className="mx-auto mt-4 p-4 bg-red-900/50 rounded-lg text-red-200 text-center max-w-md">
                    {error}
                </div>
            )}
        </div>
    )
}