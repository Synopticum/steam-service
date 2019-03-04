import {LitElement, html, css} from 'https://unpkg.com/lit-element/lit-element.js?module';

class SteamUser extends LitElement {

    static get properties() {
        return {
            games: { type: Array },
            currentSteamId: { type: String },
            isError: { type: Boolean }
        }
    }

    static get styles() {
        return css`
            :host {
                font-family: 'PT Sans', sans-serif;
                color: #fff;
                display: block;
                margin: 10px 30px 10px 20px;
                width: 400px;
            }
            
            .input {
                position: relative;
                z-index: 100;
                max-width: 500px;
            }
        
            .input__steam-id {
                box-sizing: border-box;
                font-family: 'PT Sans', sans-serif;
                font-size: 22px;
                padding: 10px 45px 10px 0;
                width: 100%;
                border: 0;
                border-bottom: 1px solid #ccc;
                color: #555;
                outline: none;
            }
            
            .icons {
                position: absolute;
                right: calc(100% + 10px);
                top: calc(50% - 20px);
                display: flex;
                align-items: center;
                justify-align: flex-end;
                height: 40px;
            }
            
            .error {
                font-size: 13px;
                width: 40px;
                height: 40px;
                background: url('/images/error.svg') no-repeat 50% 50%;
                background-size: 30px;
                transform: scale(1);
                transition: transform .1s;
            }
            
            .error.hidden {
                transform: scale(0);
            }
            
            .remove {
                cursor: pointer;
                font-size: 13px;
                width: 30px;
                height: 30px;
                background: url('/images/remove.svg') no-repeat 50% 50%;
                background-size: 20px;
            }
            
            :host(:first-child) .remove {
                display: none;
            }
        `;
    }

    constructor() {
        super();
        this.games = [];
        this.isError = false;
        this.elementId = Math.floor(Math.random() * (+10000 - +100)) + +100;
    }

    render() {
        return html`
            <div class="input">
                <input 
                    type="text" 
                    class="input__steam-id" 
                    id="steam-id" 
                    placeholder="Paste a Steam ID"
                    @keyup="${this.findGames}" 
                    @blur="${this.findGames}"
                    value="">
                    
                <div class="icons">
                    <div class="error ${!this.isError ? 'hidden' : ''}" title="Invalid steam account"></div>
                    <div class="remove" @click="${this.removeSteamId}" title="Remove Steam ID"></div>
                </div>
            </div>
        `;
    }

    async findGames(e) {
        let steamId = e.target.value.toString();

        if (steamId && this.currentSteamId !== steamId) {
            this.currentSteamId = steamId;
            this.games = [];

            try {
                await fetch(`/api/users/${steamId}/games`)
                    .then(response => response.json())
                    .then(games => {
                        if (games.error) throw new Error('Error when fetching games');

                        this.games = [...games];

                        SteamUser._notifyApp('games-fetch-success', {
                            elementId: this.elementId,
                            steamId: this.currentSteamId,
                            games: this.games
                        });

                        this.isError = false;
                    })
            } catch (e) {
                console.error(e);
                this.isError = true;
            }
        }
    }

    removeSteamId() {
        // debugger;
        SteamUser._notifyApp('remove-steam-id', { elementId: this.elementId });
        this.remove();
    }

    static _notifyApp(eventType, payload) {
        let event = new CustomEvent(eventType, { detail: payload});
        document.querySelector('steam-app').dispatchEvent(event);
    }
}

customElements.define('steam-user', SteamUser);