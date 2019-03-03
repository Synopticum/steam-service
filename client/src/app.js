import {LitElement, html, css} from 'https://unpkg.com/lit-element/lit-element.js?module';

// max. amount of user's view which can be opened
const MAX_VIEWS = 2;

class SteamApp extends LitElement {

    static get properties() {
        return {
            multiPlayerGames: { type: Array },
            viewsActive: { type: Number },
            intersectionsFound: { type: Array },

            isNextButtonDisabled: { type: Boolean },
            isNextButtonVisible: { type: Boolean },
            isIntersectionButtonDisabled: { type: Boolean },
            isIntersectionButtonVisible: { type: Boolean },

            isIntersectionsVisible: { type: Boolean },
        }
    }

    static get styles() {
        return css`
            :host {
               display: flex;
               align-items: center;
               justify-content: center;
               width: 100%;
               height: 100%;
               background-color: #161A21;
            }
            
            .nav {
                position: absolute;
                bottom: 20px;
                right: 40px;
                z-index: 200;
            }
            
            .nav__add, .nav__intersection {
                cursor: pointer;
                padding: 10px;
                border: 0;
                outline: none;
                background: none;
                font-family: 'PT Sans', sans-serif;
                font-size: 24px;
                color: #fff;
                padding: 10px 20px;
                transition: opacity 3s;
                background: rgba(255,255,255,.1);
                border-radius: 10px;
                margin-left: 10px;
            }
            
            .nav__add:disabled, .nav__intersection:disabled {
                cursor: not-allowed;
                opacity: .2;
            }
            
            .nav__add.hidden, .nav__intersection.hidden {
                display: none;
            }
            
            dialog {
                position: fixed;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                z-index: 300;
            }
        `;
    }

    constructor() {
        super();

        // defaults
        this.multiPlayerGames = [];
        this.viewsActive = 1;
        this.intersectionsFound = [];

        this.isNextButtonDisabled = true;
        this.isNextButtonVisible = false;
        this.isIntersectionButtonDisabled = true;
        this.isIntersectionButtonVisible = false;

        this.isIntersectionsVisible = false;

        this.addEventListener('games-fetched', e => {
            this.onGamesFetched(e)
        });
    }

    render() {
        return html`
            <steam-user></steam-user>
            
            <div class="nav">
                <button 
                    class="nav__intersection ${!this.isIntersectionButtonVisible ? 'hidden' : ''}" 
                    @click="${this.findCommonGames}" 
                    .disabled="${this.isIntersectionButtonDisabled}">Show intersections</button>
                    
                <button 
                    class="nav__add ${!this.isNextButtonVisible ? 'hidden' : ''}" 
                    @click="${this.nextFriend}" 
                    .disabled="${this.isNextButtonDisabled}">Add friend</button>
            </div>
            
            <dialog .open="${this.isIntersectionsVisible}">${this.intersectionsFound.map(game => html`<div class="intersection">${game}</div>`)}</dialog>
        `;
    }

    onGamesFetched(e) {
        let allGames = e.detail.games;
        let multiPlayerGames = allGames.filter(game => game.tags['Multiplayer']).map(game => game.name);

        this.multiPlayerGames = [...this.multiPlayerGames, multiPlayerGames];

        if (this.viewsActive <= MAX_VIEWS) {
            this.isNextButtonDisabled = false;
            this.isNextButtonVisible = true;
        }

        if (this.multiPlayerGames.length >= MAX_VIEWS) {
            this.isIntersectionButtonDisabled = false;
            this.isIntersectionButtonVisible = true;
        }
    }

    findCommonGames() {
        this.intersectionsFound = _.intersection(...this.multiPlayerGames);
        this.isIntersectionsVisible = true;
    }

    nextFriend() {
        this.viewsActive++;

        let node = document.createElement('steam-user');
        this.shadowRoot.appendChild(node);

        if (this.viewsActive >= MAX_VIEWS) {
            this.isNextButtonVisible = false;
        } else {
            this.isNextButtonDisabled = false;
        }
    }
}

customElements.define('steam-app', SteamApp);