import {LitElement, html, css} from 'https://unpkg.com/lit-element/lit-element.js?module';

class SteamUser extends LitElement {

    static get properties() {
        return {
            games: { type: Array },
            currentUser: { type: String }
        }
    }

    static get styles() {
        return css`
            :host {
                position: relative;
                padding: 0 20px;
                font-family: 'PT Sans', sans-serif;
                color: #fff;
                width: 100%;
                height: 100%;
                display: flex;
                flex: 1;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            
            .input {
                position: relative;
                z-index: 100;
                max-width: 500px;
            }
            
            .input__label {
                font-size: 18px;
                font-style: italic;
                background-color: #161A21;
            }
        
            .input__steam-id {
                box-sizing: border-box;
                font-family: 'PT Sans', sans-serif;
                background: url('/src/enter.svg') no-repeat calc(100% - 15px) 50% #306282;
                background-size: 25px 25px;
                border: 1px solid #22445B;
                font-size: 22px;
                padding: 10px 45px 10px 15px;
                margin: 5px 0;
                width: 100%;
                max-width: 500px;
                border: 1px solid rgba(255,255,255,.1);
                border-radius: 10px;
                box-shadow: 3px 3px 3px rgba(0,0,0,.15);
                color: #fff;
                outline: none;
                transition: border, .3s;
            }
            
            #steam-id:hover {
            }
            
            .games {
                font-family: 'VT323', monospace;
                text-transform: uppercase;
                user-select: none;
                opacity: .5;
                position: absolute;
                z-index: 50;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                overflow: hidden;
                line-height: 1.4;
            }
            
            .games::before, .games::after {
                content: '';
                position: absolute;
                left: 0;
                z-index: 75;
                width: 100%;
                height: 200px;
            }
            
            .games::before {
                top: 0;
                background-image: linear-gradient(to top, rgba(0,0,0,0), rgba(0,0,0,1));
            }
            
            .games::after {
                bottom: 0;
                background-image: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1));
            }
            
            .games__game {
                color: #376F95;
                font-size: 20px;
            }
            
            .games__game--multiplayer {
                color: #66C0F4;
            }
            
            .games__game--multiplayer::after {
                content: ' ✓';
            }
        `;
    }

    constructor() {
        super();
        this.games = [];
    }

    render() {
        return html`
            <div class="input">
                <label class="input__label" for="steam-id">Paste a Steam ID to find all multi-player games</label>
                <input type="text" class="input__steam-id" id="steam-id" @keyup="${this.findGames}">
            </div>
            
            <div class="games">
                ${this.games.map(game => html`<div class="games__game ${this._isMultiplayer(game)}">${game.name}</div>`)}
            </div>
        `;
    }

    async findGames(e) {
        if (e.key === 'Enter') {
            let user = e.target.value.toString();

            if (user && this.currentUser !== user) {
                this.currentUser = user;
                this.games = [];

                try {
                    await fetch(`/api/users/${user}/games`).then(response => {
                        const reader = response.body.getReader();
                        this._consumeGamesStream(reader);
                    })
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    _consumeGamesStream(reader) {
        reader.read().then(result => {
            if (!result.done) {
                let game = JSON.parse(new TextDecoder("utf-8").decode(result.value));
                this.games = [...this.games, game];
                this._consumeGamesStream(reader);
            } else {
                this._notifyApp();
            }
        })
    }

    _isMultiplayer(game) {
        return game.tags && game.tags['Multiplayer'] ? 'games__game--multiplayer' : '';
    }

    _notifyApp() {
        let event = new CustomEvent('games-fetched', {
            detail: {
                user: this.currentUser,
                games: this.games
            }
        });

        document.querySelector('steam-app').dispatchEvent(event);
    }
}

customElements.define('steam-user', SteamUser);