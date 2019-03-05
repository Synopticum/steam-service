import {LitElement, html, css} from 'https://unpkg.com/lit-element/lit-element.js?module';

class SteamApp extends LitElement {

    static get properties() {
        return {
            inputs: { type: Array },
            commonGames: { type: Array }
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
            
            .inputs, .common-games {
                box-sizing: border-box;
                overflow-y: auto;
            }
            
            .inputs {
               display: flex;
               flex: 1;
               direction: rtl;
            }
            
            .inputs__wrapper {
                direction: ltr;
                box-sizing: border-box;
                display: flex;
                flex: 1;
                flex-direction: column;
                align-items: flex-end;
                justify-content: center;
                padding-right: 10px;
            }
            
            .common-games {
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
            
            .common-games--default-centering {
                justify-content: center;
            }
            
            .common-games--overflow-centering {
                justify-content: normal;
            }
            
            .common-games--overflow-centering .common-games__item {
                width: 100%;              
                margin: auto;
            }
        `;
    }

    constructor() {
        super();

        // defaults
        this.inputs = [];
        this.commonGames = [];

        this.addEventListener('games-fetch', e => { this.onGamesFetched(e) });
        this.addEventListener('remove-input', e => { this.removeInput(e.detail.elementId) });
        this.addEventListener('reset-input', e => { this.resetInput(e.detail.elementId) });
    }

    render() {
        return html`
            <div class="inputs">
                <div class="inputs__wrapper">
                    <steam-input placeholder="Enter your Steam ID"></steam-input>
                </div>
            </div>
            
            <div class="common-games common-games--default-centering">
                ${this.commonGames.length ? 
                    this.commonGames.map(game => html`<div class="common-games__item">${game}</div>`) :
                    html`No common multi-player games found<br>Please add at least two Steam IDs`}
            </div>
        `;
    }

    onGamesFetched(e) {
        let { elementId, steamId, games } = e.detail;

        if (!this._hasExistingInputUpdated(elementId)) this._addInput();

        this._updateGames(elementId, steamId, games);

        if (this._isEnoughDataToCompare) this.findCommonGames();
    }

    findCommonGames() {
        let inputs = this.inputs.filter(input => !!input);

        this._isEnoughDataToCompare(inputs) ?
            this.commonGames = _.intersection(...inputs.map(input => input.games)) :
            this.commonGames = [];

        _.defer(this._correctGamesListCentering.bind(this));
    }

    removeInput(elementId) {
        let inputs = this.inputs.slice();
        inputs[elementId] = undefined;

        this.inputs = inputs;
        this.findCommonGames();
    }

    resetInput(elementId) {
        let inputs = this.inputs.slice();

        if (inputs[elementId]) inputs[elementId].games = [];

        this.inputs = inputs;
        this.findCommonGames();
    }

    _addInput() {
        let node = document.createElement('steam-input');
        node.setAttribute('placeholder', 'Enter your friend\'s Steam ID');
        this.shadowRoot.querySelector('.inputs__wrapper').appendChild(node);
    }

    _updateGames(elementId, steamId, games) {
        let inputs = _.clone(this.inputs);
        inputs[elementId] = { steamId, games };
        this.inputs = inputs;
    }

    _hasExistingInputUpdated(elementId) {
        return this.inputs[elementId];
    }

    _isEnoughDataToCompare(games) {
        return games.filter(item => item !== undefined).length > 1;
    }

    _correctGamesListCentering() {
        // fixes issue related to centering overflown flexbox container
        // https://stackoverflow.com/questions/33454533/cant-scroll-to-top-of-flex-item-that-is-overflowing-container
        let result = this.shadowRoot.querySelector('.common-games');

        if (SteamApp._isOverflown(result)) {
            result.classList.remove('common-games--default-centering');
            result.classList.add('common-games--overflow-centering');
        } else {
            result.classList.remove('common-games--overflow-centering');
            result.classList.add('common-games--default-centering');
        }
    }

    static _isOverflown(element) {
        return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
    }
}

customElements.define('steam-app', SteamApp);