import {LitElement, html, css} from 'https://unpkg.com/lit-element/lit-element.js?module';

class SteamInput extends LitElement {

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
                position: relative;
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
            
            .error__text {
                position: absolute;
                bottom: 100%;
                left: -45px;
                width: 130px;
                transform: scale(0);
                transition: transform .1s;
                white-space: nowrap;
                text-align: center;
                color: #666;
            }
            
            .error:hover .error__text {
                transform: scale(1);
            }
            
            .remove {
                cursor: pointer;
                font-size: 13px;
                width: 30px;
                height: 30px;
                background: url('/images/remove.svg') no-repeat 50% 50%;
                background-size: 20px;
            }
            
            .remove.hidden {
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
        let placeholder = this.attributes.placeholder.value;

        return html`
            <div class="input">
                <input 
                    type="text" 
                    class="input__steam-id" 
                    id="steam-id" 
                    placeholder="${placeholder}"
                    @keyup="${_.debounce(this.findGames, 300)}" 
                    @blur="${this.findGames}"
                    value="">
                    
                <div class="icons">
                    <div class="error ${!this.isError ? 'hidden' : ''}">
                        <div class="error__text">Steam ID not found</div>
                    </div>
                    
                    <div class="remove ${_.isEmpty(this.games) ? 'hidden' : ''}" @click="${this.removeSteamId}" title="Remove"></div>
                </div>
            </div>
        `;
    }

    async findGames() {
        let steamId = this.shadowRoot.querySelector('#steam-id').value || '';
        if (this._hasChanged(steamId)) await this._updateGames(steamId);
    }

    removeSteamId() {
        SteamInput._notifyApp('remove-input', { elementId: this.elementId });
        this.remove();
    }

    resetSteamId() {
        this.games = [];
        SteamInput._notifyApp('reset-input', { elementId: this.elementId })
    }

    _hasChanged(steamId) {
        return steamId && this.currentSteamId !== steamId;
    }

    async _updateGames(steamId) {
        this.currentSteamId = steamId;
        this.games = [];

        try {
            let games = await SteamInput._getGamesFor(steamId);
            this._setGames(games);
        } catch (e) {
            this._handleFetchError();
        }
    }

    _handleFetchError() {
        this.isError = true;
        this.resetSteamId();
    }

    static async _getGamesFor(steamId) {
        return fetch(`/api/users/${steamId}/games`).then(response => response.json());
    }

    _setGames(games) {
        if (games.error) throw new Error('Error when fetching games');

        this.games = [...games];

        SteamInput._notifyApp('games-fetch', {
            elementId: this.elementId,
            steamId: this.currentSteamId,
            games: this.games
        });

        this.isError = false;
    }

    static _notifyApp(eventType, payload) {
        let event = new CustomEvent(eventType, { detail: payload});
        document.querySelector('steam-app').dispatchEvent(event);
    }
}

customElements.define('steam-input', SteamInput);