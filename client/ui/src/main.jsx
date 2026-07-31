import { render } from 'preact'
import './index.css'
import App from './app.jsx'
import { GlobalStateProvider } from './components/ClientContext.jsx'
import { init, setFocus } from '@noriginmedia/norigin-spatial-navigation';

init({ });

window.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        var focusedEl = document.querySelector('.focus');
        if (focusedEl) focusedEl.click();
    } else if (e.keyCode === 10009) {
        if (location.pathname !== '/tizenbrew-ui/dist/index.html') {
            history.back();
            setFocus('sn:focusable-item-1');
        } else {
            try { tizen.application.getCurrentApplication().exit(); } catch (e) {}
        }
    }
});

render(<GlobalStateProvider><App /></GlobalStateProvider>, document.getElementById('app'));