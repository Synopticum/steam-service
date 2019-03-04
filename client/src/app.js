import {LitElement, html, css} from 'https://unpkg.com/lit-element/lit-element.js?module';

class SteamApp extends LitElement {

    static get properties() {
        return {
            multiPlayerGames: { type: Array },
            intersectionsFound: { type: Array }
        }
    }

    static get styles() {
        return css`
            :host {
               width: 100%;
               height: 100%;
               background-color: #fff;
               display: flex;
            }
            
            .steam-ids, .intersections {
                box-sizing: border-box;
                overflow-y: auto;
            }
            
            .steam-ids {
               display: flex;
               flex: 1;
               direction: rtl;
            }
            
            .steam-ids__wrapper {
                direction: ltr;
                box-sizing: border-box;
                display: flex;
                flex: 1;
                flex-direction: column;
                align-items: flex-end;
                justify-content: center;
                padding-right: 10px;
            }
            
            .intersections {
                display: flex;
                flex: 1;
                flex-direction: column;
                padding-left: 10px;
                font-family: 'VT323', monospace;
                font-size: 21px;
                text-transform: uppercase;
                line-height: 1.5;
                color: #999;
            }
            
            .intersections--default-centering {
                justify-content: center;
            }
            
            .intersections--overflow-centering {
                justify-content: normal;
            }
            
            .intersections--overflow-centering .intersections__item {
                width: 100%;              
                margin: auto;
            }
        `;
    }

    constructor() {
        super();

        // defaults
        this.multiPlayerGames = [];
        this.intersectionsFound = [];

        this.addEventListener('games-fetch-success', e => { this.onGamesFetched(e) });
        this.addEventListener('remove-steam-id', e => { this.removeSteamId(e) });
    }

    render() {
        return html`
            <div class="steam-ids">
                <div class="steam-ids__wrapper">
                    <steam-user></steam-user>
                </div>
            </div>
            
            <div class="intersections intersections--default-centering">
                ${this.intersectionsFound.map(game => html`<div class="intersections__item">${game}</div>`)}
            </div>
        `;
    }

    onGamesFetched(e) {
        let existingSteamIds = this.multiPlayerGames.map(item => item.steamId);

        if (!_.contains(existingSteamIds, e.detail.steamId)) {
            this.multiPlayerGames = [...this.multiPlayerGames, {
                elementId: e.detail.elementId,
                steamId: e.detail.steamId,
                games: e.detail.games
            }];
            this.addSteamId();

            if (this.multiPlayerGames.length > 1) {
                this.findCommonGames();
            }
        }
    }

    findCommonGames() {
        if (this.multiPlayerGames.length > 1) {
            let games = this.multiPlayerGames.map(item => item.games);
            this.intersectionsFound = _.intersection(...games);
        } else {
            this.intersectionsFound = [];
        }

        // correct CSS vertical centering when needed
        _.defer(this._fixResultCentering.bind(this));
    }

    addSteamId() {
        let node = document.createElement('steam-user');
        this.shadowRoot.querySelector('.steam-ids__wrapper').appendChild(node);
    }

    removeSteamId(e) {
        let elementId = e.detail.elementId;
        this.multiPlayerGames = this.multiPlayerGames.filter(item => item.elementId !== elementId);
        this.findCommonGames();
    }

    _fixResultCentering() {
        let result = this.shadowRoot.querySelector('.intersections');

        if (this._isOverflown(result)) {
            result.classList.remove('intersections--default-centering');
            result.classList.add('intersections--overflow-centering');
        } else {
            result.classList.remove('intersections--overflow-centering');
            result.classList.add('intersections--default-centering');
        }
    }

    _isOverflown(element) {
        return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
    }
}

customElements.define('steam-app', SteamApp);