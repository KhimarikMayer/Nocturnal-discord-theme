/**
 * @name Nocturnal
 * @author KhimarikMayer
 * @description A plugin that allows the Nocturnal theme to use those modified things that you can't change so easily with regular CSS, or vice versa, which used to change somehow and after that it's not so easy, the so-called very mandatory.
 * @version 1.0
 */
const betterdiscord = new BdApi("Nocturnal");
const react = BdApi.React;

let FormSwitch;

class Nocturnal {
    constructor() {
        this.observer = null;
        this.interval = null;
        this.style = null;
        this.iconStyle = null;
        this.isRunning = false;
        this.processedCards = new WeakSet();
        this.processedEmpty = new WeakSet();
        this.processedMasks = new WeakSet();
        this.processedRoleDots = new WeakSet();
        this.processedIconAccessory = new WeakSet();
        this.originalCardData = new Map();
        this.settings = {
            styleVersion: '2023',
            colorizeIcons: false
        };
        this.loadSettings();
    }
    
start() {
    this.isRunning = true;
    this.originalCardData.clear();
    this.injectStyles();
    this.injectIconStyles();
    this.processedCards = new WeakSet();
    this.processedEmpty = new WeakSet();
    this.processedMasks = new WeakSet();
    this.processedRoleDots = new WeakSet();
    this.processedIconAccessory = new WeakSet();
    this.processCards();
    this.processEmptySVG();
    this.processMaskCircles();
    this.processRoleDots();
    this.processIconAccessoryCircles();
    
    this.interval = setInterval(() => {
        if (!this.isRunning) return;
        this.processRoleDots();
        this.processEmptySVG();
        this.processMaskCircles();
        this.processIconAccessoryCircles();
    }, 0);
    const accountObserver = new MutationObserver((mutations) => {
        if (!this.isRunning) return;
        
        let hasNewEmptyElements = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches('svg.empty__99e7c')) {
                            hasNewEmptyElements = true;
                            break;
                        }
                        if (node.querySelectorAll) {
                            const empties = node.querySelectorAll('svg.empty__99e7c');
                            if (empties.length) {
                                hasNewEmptyElements = true;
                                break;
                            }
                        }
                    }
                }
            }
            if (hasNewEmptyElements) break;
        }
        
        if (hasNewEmptyElements) {
            setTimeout(() => {
                this.processEmptySVG();
            }, 50);
        }
    });
    
    accountObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    this.accountObserver = accountObserver;
    
    this.observer = new MutationObserver((mutations) => {
        if (!this.isRunning) return;
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches('.accountProfileCard_a27e58')) {
                            this.processSingleCard(node);
                        }
                        if (node.querySelectorAll) {
                            const cards = node.querySelectorAll('.accountProfileCard_a27e58');
                            cards.forEach(card => this.processSingleCard(card));
                        }
                        
                        if (node.matches && node.matches('mask')) {
                            this.processSingleMask(node);
                        }
                        if (node.querySelectorAll) {
                            const masks = node.querySelectorAll('mask');
                            masks.forEach(mask => this.processSingleMask(mask));
                        }
                        
                        if (node.matches && node.matches('.roleDot_af3987 circle, .roleDot__48c1c circle')) {
                            this.processRoleDots();
                        }
                        if (node.querySelectorAll) {
                            const dots = node.querySelectorAll('.roleDot_af3987 circle, .roleDot__48c1c circle');
                            if (dots.length) this.processRoleDots();
                        }
                    }
                }
            }
        }
    });
    
    this.observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

processSingleMask(mask) {
    if (!this.isRunning) return;
    if (this.processedMasks.has(mask)) return;
    if (mask.querySelector('.nocturnal-mask-rect')) {
        this.processedMasks.add(mask);
        return;
    }
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('fill', 'black');
    rect.setAttribute('class', 'nocturnal-mask-rect');
    rect.setAttribute('data-nocturnal-mask-rect', 'true');
    mask.appendChild(rect);
    this.processedMasks.add(mask);
}

processSingleCard(card) {
    if (this.processedCards.has(card)) return;
    
    const maskSvg = card.querySelector('.mask__68edb');
    if (!maskSvg) return;

    if (!this.originalCardData.has(card)) {
        const clonedMask = maskSvg.cloneNode(true);
        this.originalCardData.set(card, {
            maskSvg: clonedMask,
            banner: maskSvg.querySelector('.banner__68edb') ? maskSvg.querySelector('.banner__68edb').cloneNode(true) : null
        });
    }
    
    if (this.settings.styleVersion === '2023') {
        const banner = maskSvg.querySelector('.banner__68edb');
        if (banner) {
            card.insertBefore(banner, maskSvg);
        }
    }
    maskSvg.remove();
    this.processedCards.add(card);
    card.setAttribute('data-nocturnal-processed', 'true');
    
    this.processMaskCircles();
    this.processRoleDots();
}

stop() {
    this.isRunning = false;
    
    if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
    }

    if (this.accountObserver) {
        this.accountObserver.disconnect();
        this.accountObserver = null;
    }
    
    if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
    }
    
    if (this.style) {
        this.style.remove();
        this.style = null;
    }

    if (this.iconStyle) {
        this.iconStyle.remove();
        this.iconStyle = null;
    }
    
    this.restoreOriginalElements();
    
    const avatars = document.querySelectorAll('.avatar_a27e58');
    avatars.forEach(avatar => {
        if (avatar.style) {
            const originalDisplay = avatar.style.display;
            avatar.style.display = 'none';
            setTimeout(() => { avatar.style.display = originalDisplay; }, 0);
        }
    });
    
    this.processedCards = new WeakSet();
    this.processedEmpty = new WeakSet();
    this.processedMasks = new WeakSet();
    this.processedRoleDots = new WeakSet();
}

restoreOriginalElements() {
    const cards = document.querySelectorAll('.accountProfileCard_a27e58');
    cards.forEach(card => {
        if (card.hasAttribute('data-nocturnal-processed')) {
            const originalData = this.originalCardData.get(card);
            if (originalData && originalData.maskSvg) {
                const existingMaskSvg = card.querySelector('.mask__68edb');
                if (!existingMaskSvg) {
                    const restoredMask = originalData.maskSvg.cloneNode(true);
                    card.appendChild(restoredMask);
                }
            }
            card.removeAttribute('data-nocturnal-processed');
        }
    });
    this.originalCardData.clear();
    
    const maskRects = document.querySelectorAll('.nocturnal-mask-rect');
    maskRects.forEach(rect => {
        if (rect && rect.parentNode) {
            rect.remove();
        }
    });
    
    this.processedMasks = new WeakSet();
    
    const roleRects = document.querySelectorAll('rect[data-nocturnal-restore]');
    roleRects.forEach(rect => {
        const originalCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        originalCircle.setAttribute('cx', rect.getAttribute('data-cx') || '0');
        originalCircle.setAttribute('cy', rect.getAttribute('data-cy') || '0');
        originalCircle.setAttribute('r', rect.getAttribute('data-r') || '0');
        originalCircle.setAttribute('fill', rect.getAttribute('fill') || '');
        originalCircle.setAttribute('class', rect.getAttribute('data-class') || '');
        if (rect.parentNode) {
            rect.parentNode.replaceChild(originalCircle, rect);
        }
    });
    
    const emptyRects = document.querySelectorAll('rect[data-original-circle]');
    emptyRects.forEach(rect => {
        const originalCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        originalCircle.setAttribute('cx', rect.getAttribute('data-cx') || '16');
        originalCircle.setAttribute('cy', rect.getAttribute('data-cy') || '16');
        originalCircle.setAttribute('r', rect.getAttribute('data-r') || '16');
        originalCircle.setAttribute('fill', rect.getAttribute('fill') || 'currentColor');
        if (rect.getAttribute('data-opacity')) {
            originalCircle.setAttribute('opacity', rect.getAttribute('data-opacity'));
        }
        if (rect.parentNode) {
            rect.parentNode.replaceChild(originalCircle, rect);
        }
    });
}
    
loadSettings() {
    try {
        const saved = betterdiscord.Data.load('settings');
        if (saved) {
            if (saved.styleVersion) this.settings.styleVersion = saved.styleVersion;
            if (saved.colorizeIcons !== undefined) this.settings.colorizeIcons = saved.colorizeIcons;
        }
    } catch(e) {}
}
    
    saveSettings() {
        try {
        betterdiscord.Data.save('settings', { 
            styleVersion: this.settings.styleVersion,
            colorizeIcons: this.settings.colorizeIcons
        });
    } catch(e) {}
        this.processedCards = new WeakSet();
        this.processedMasks = new WeakSet();
        this.applyStyles();
        this.processCards();
        this.applyIconStyles();
    }
    
    applyStyles() {
        if (this.style) {
            this.style.remove();
            this.style = null;
        }
        this.injectStyles();
    }

    applyIconStyles() {
        if (this.iconStyle) {
            this.iconStyle.remove();
            this.iconStyle = null;
        }
    this.injectIconStyles();
    }
    
    injectStyles() {
        if (this.style) return;
        
        const style = document.createElement('style');
        style.id = 'nocturnal-styles';
        
        if (this.settings.styleVersion === '2023') {
            style.textContent = '.accountProfileCard_a27e58 .avatar_a27e58{background-color:var(--backgroundDarker);border:7px solid var(--backgroundDarker);top:75px;inset-inline-start:15px;}';
        } else {
            style.textContent = '.reaction__23977 .emoji,.reaction_f8896c .emoji {height: 1rem;margin: .125rem 0;min-height: auto;min-width: auto;width: 1rem;}.reactionCount__23977,.reactionCount_f8896c {min-width: 9px !important;font-size: 0.875rem;} .theme-dark .ephemeral__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover,.theme-dark .replying__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover,.theme-dark .ephemeral__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55,.theme-dark .replying__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55{padding: .5px 5px !important;}.theme-dark .ephemeral__5126c .obscuredTextContent__299eb .wrapper_f61d60:not([style],.roleMention__75297[style]),.theme-dark .ephemeral__5126c .obscuredTextContent__299eb .interactive:not([style],.roleMention__75297[style]):hover,.theme-dark .ephemeral__5126c .obscuredTextContent__299eb .interactive:not([style],.roleMention__75297[style])[aria-expanded=true],.theme-dark .replying__5126c .obscuredTextContent__299eb .wrapper_f61d60:not([style],.roleMention__75297[style]),.theme-dark .replying__5126c .obscuredTextContent__299eb .interactive:not([style],.roleMention__75297[style]):hover,.theme-dark .replying__5126c .obscuredTextContent__299eb .interactive:not([style],.roleMention__75297[style])[aria-expanded=true],.theme-dark .replying__5126c .obscuredTextContent__299eb .interactive:not([style],.roleMention__75297[style])[aria-expanded=true] {padding: .5px 5px !important;}.theme-dark .ephemeral__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover,.theme-dark .replying__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover,.theme-dark .ephemeral__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55,.theme-dark .replying__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55{background-color: rgba(0, 0, 0, 0) !important;color: var(--text-link) !important;padding: 0 !important;}.theme-dark .ephemeral__5126c .wrapper_f61d60:not([style],.roleMention__75297[style]),.theme-dark .ephemeral__5126c .interactive:not([style],.roleMention__75297[style]):hover,.theme-dark .ephemeral__5126c .interactive:not([style],.roleMention__75297[style])[aria-expanded=true],.theme-dark .replying__5126c .wrapper_f61d60:not([style],.roleMention__75297[style]),.theme-dark .replying__5126c .interactive:not([style],.roleMention__75297[style]):hover,.theme-dark .replying__5126c .interactive:not([style],.roleMention__75297[style])[aria-expanded=true],.theme-dark .replying__5126c .interactive:not([style],.roleMention__75297[style])[aria-expanded=true] {background-color: rgba(0, 0, 0, 0) !important;color:hsl(203, 91%, 48%)!important;padding: 0 !important;}.theme-dark .mentioned__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55,.theme-dark .mentioned__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover{background-color: rgba(0, 0, 0, 0) !important;padding: .5px 5px !important;}.theme-dark .mentioned__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55,.theme-dark .mentioned__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover{background-color: rgba(0, 0, 0, 0) !important;padding: 0 !important;}.theme-dark .mentioned__5126c .obscuredTextContent__299eb .wrapper_f61d60.roleMention__75297,.theme-dark .mentioned__5126c .obscuredTextContent__299eb .interactive{padding: .5px 5px !important;}.burstGlow__23977{border-radius:5px;}img[src="/assets/18e336a74a159cfd.png"] {content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/blurpleold.png") !important;}img[src="/assets/788f05731f8aa02e.png"] {content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/grayold.png");}img[src="/assets/9855d7e3b9780976.png"] {content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/greenold.png");}img[src="/assets/2ccd8ae8b2379360.png"] {content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/yellowold.png");}img[src="/assets/411d8a698dd15ddf.png"] {content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/redold.png");}img[src="/assets/320d5a40d309f942.png"] {content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/pinkold.png");}.theme-dark .mentioned__5126c .interactive:not([style],.roleMention__75297[style]):hover,.theme-dark .mentioned__5126c .interactive:not([style],.roleMention__75297[style])[aria-expanded=true] {color: var(--primary) !important;}.loadingPopout__58f1c,.loadingPopout__58f1c .spinner__46696{display: none;}.reaction_f8896c:not([style*="background"]):hover,.reaction__23977:not([style*="background"]):hover,.reaction_f8896c:active,.reaction__23977:not([style*="background"]):active {background-color: var(--backgroundDark-25) !important;}.secondary_a22cb0.addReactButton__34c2c{color: var(--control-secondary-text-default) !important;}.secondary_a22cb0.addReactButton__34c2c:hover:not(:disabled){color: var(--control-secondary-text-hover) !important;}.secondary_a22cb0.addReactButton__34c2c:active:not(.color_f9d37d.banner_fb7f94, :disabled){color: var(--control-secondary-text-active) !important;}.secondary_a22cb0.addReactButton__34c2c,.secondary_a22cb0.addReactButton__34c2c:hover:not(:disabled),.secondary_a22cb0.addReactButton__34c2c:active:not(.color_f9d37d.banner_fb7f94,:disabled) {background: rgba(0, 0, 0, 0) !important;border: none !important;font-size: 0px;padding: 0px;min-width: 1.5rem;}.theme-dark .reactionBtn__23977 {border-radius: 5px;margin-bottom: 1px;background: none !important;border: none !important;}html.visual-refresh {.reactionBtn__23977:hover {background: none;}}.reaction_f8896c.reactionMe_f8896c:not([style*="background"]) .reactionCount_f8896c, .reaction__23977.reactionMe__23977:not([style*="background"]) .reactionCount__23977 {color: var(--primary) !important;}.reaction__23977.reactionMe__23977:not([style*="background"]),.reaction_f8896c.reactionMe_f8896c:not([style*="background"]) {background-color: var(--primary-30a) !important;}.reactionInner__23977,.reaction_f8896c.reactionInner_f8896c {padding: 0 0.375rem !important;}.reaction_f8896c, .reaction__23977 {border-radius: 5px;border: none !important;margin-bottom: 0.125rem;transition: background-color 0.1s ease;}.message__5126c.mentioned__5126c:not(.automodMessage__5126c),.message__5126c.highlighted_d5deea:not(.automodMessage__5126c), .message__5126c.replying__5126c:not(.automodMessage__5126c){background-color: var(--primary-05a) !important;}.message__5126c.mentioned__5126c.selected__5126c:not(.automodMessage__5126c),.mouse-mode.full-motion .message__5126c.mentioned__5126c:hover:not(.automodMessage__5126c),.message__5126c.replying__5126c.selected__5126c:not(.automodMessage__5126c), .mouse-mode.full-motion .message__5126c.replying__5126c:not(.automodMessage__5126c):hover {background-color: hsl(204 calc(var(--saturation-factor)*100%) 45% /0.1) !important;}.theme-dark .mentioned__5126c .wrapper_f61d60:not([style],.roleMention__75297[style]),.theme-dark .mentioned__5126c .wrapper_f61d60:not([style],.roleMention__75297[style]):hover,.theme-dark .mentioned__5126c .interactive:not([style],.roleMention__75297[style]),.theme-dark .mentioned__5126c .interactive:not([style],.roleMention__75297[style]):hover,.theme-dark .mentioned__5126c .interactive:not([style],.roleMention__75297[style])[aria-expanded=true],.theme-dark .mentioned__5126c .wrapper_f61d60.roleMention__75297,.theme-dark .replying__5126c .wrapper_f61d60[style],.theme-dark .replying__5126c .roleMention__75297[style] {background: rgba(0, 0, 0, 0) !important;padding: 0;}.theme-dark .wrapper_f61d60:not([style],.roleMention__75297[style]){border-radius: 50px;padding: .5px 5px;color: hsl(203, 91%, 48%)!important;background: hsl(204, 100%, 45%, 10%)!important;}.theme-dark .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55 {background-color: hsl(204, 100%, 45%, 10%)!important;border-radius: 50px;padding: .5px 5px;transition: all .2s ease;}.theme-dark .wrapper_f61d60,.theme-dark .interactive {transition: all .2s ease;}.theme-dark .mention {border-radius: 50px;padding: .5px 5px;}.theme-dark .interactive:not([style],.roleMention__75297[style]):hover,.theme-dark .interactive:not([style],.roleMention__75297[style])[aria-expanded=true],.theme-dark .mentioned__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55,.theme-dark .mentioned__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover,.theme-dark .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover {background-color: var(--primary)!important;color: #fff!important;}.theme-dark .accountProfileCard_a27e58{background:linear-gradient(45deg,#ee7752,#e73c7e,#23a6d5,#23d5ab);background-size:400% 400%;animation:nocturnalGradient 15s ease infinite;}@keyframes nocturnalGradient{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}.background_a27e58{background-image:none !important;background-color:var(--backgroundDark-30) !important;margin:0 16px 16px !important;}.accountProfileCard_a27e58 .avatar_a27e58{top:16px !important;left:16px !important;inset-inline-start:16px !important;}.userInfo_a27e58{padding-left:112px !important;padding-top:40px !important;padding-bottom:12px !important;}.accountProfileCard_a27e58 .banner__68edb{display:none !important;}.badgeList_a27e58{background-image:none !important;background-color:var(--backgroundDark-30) !important;}';
        }
        
        document.head.appendChild(style);
        this.style = style;
    }

    injectIconStyles() {
    if (this.iconStyle) this.iconStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'nocturnal-icon-styles';
    
    if (this.settings.colorizeIcons) {
        style.textContent = `
            .spriteGreyscale__04eed {
	background-color: var(--primary);
}

.hoverButton__06ab4,
.controlIcon_cf09d8 path,
.bd-search-wrapper>svg,
.bd-select-arrow,
.platformUrlIcon__9bfb9,
.winButtons_c38106,
.winButtonMinMax_c38106:hover,
.winButtonMinMax_c38106:active,
.colorable_f1ceac.primaryDark_f1ceac, .colorable_f1ceac.primaryDark_f1ceac .centerIcon_f1ceac,
.colorable_f1ceac.primaryDark_f1ceac, .colorable_f1ceac.primaryDark_f1ceac .controlIcon_f1ceac,
.chatIcon__233f8.controlIcon_f1ceac,
.inboxIcon_ab6641,
.icon__9293f,
.icon__2ea32:not(.iconLive_c69b6d),
.actionIcon_c69b6d,
.clickable__9293f .icon__9293f,
.wrapperCommon__29444,
.addButtonIcon__29444:hover,
.wrapper__29444.muted__29444:hover .icon__29444,
.wrapper__29444:hover .icon__29444,
.raisedHandIcon__15cd2,
.attachButton__0923f,
.button__24af7,
.active__24af7 .buttonWrapper__24af7,
.buttonWrapper__24af7:hover,
.button_e6e74f,
.button_e6e74f:active,
.button_e6e74f:hover,
.buttonActive_e6e74f,
.closeIcon_d9c882,
.threadIcon_d9c882,
.closeIcon_d9c882:hover,
.icon-only_a22cb0,
.navItemIcon__551b0,
.button_f7ecac,
.activityIcon_b1f768,
.visual-refresh .reactionBtn__23977 .icon__23977,
.visual-refresh .reactionBtn__23977 .icon_f8896c,
.categoryIcon_b9ee0c,
.categoryItemDefaultCategorySelected_b9ee0c .categoryIcon_b9ee0c,
.categoryItemDefaultCategorySelected_b9ee0c:hover .categoryIcon_b9ee0c,
.unicodeShortcut_b9ee0c,
.icon_dba1d2,
.bannerColor_fb7f94,
.bannerButton_fb7f94,
.staticIcon_bba883,
.cardIcon__1a4ef path,
.button_bba883,
.actionButton_f8fa06:not(.actionDeny_f8fa06:hover),
.voiceIcon_adebba,
.icon_d0b769,
.resultsGroup__16eb0 .searchClearHistory__16eb0,
.resultsGroup__16eb0 .searchLearnMore__16eb0,
.icon__71961,
.closeButton_c2b141,
.icon_fea832,
.tutorialIcon__2692d,
.copyButton__252af,
.icon__13533,
.selected__1a58a .icon__1a58a,
.selected__1a58a:hover .icon__1a58a,
.icon__1a58a,
.removeIcon__1a4ef,
.clickable_c99c29,
.clickable__81391,
.messageCountIcon_faa96b,
.dragIcon__5f97b,
.menu__81b3e,
.addRole_e29cd7,
.icon__710ee,
.button__9a406,
.icon_9cab3e,
button.button__67645:not(.plateMuted__67645,.redGlow__67645),
span.button__67645:not(.plateMuted__67645,.redGlow__67645),
.backForwardButtons__63abb .button__63abb,
.collapseButton__35a7e,
.connectedAccountOpenIcon_e6abe8,
.channelIcon__628e6,
.icon_f2170c,
.leftTrayIcon_cb9592 .controlIcon_f1ceac,
.rightTrayIcon_cb9592 .controlIcon_f1ceac,
.secondaryButton__9be63,
.secondaryIcon__84bad,
.secondaryIconDisabled__84bad,
.iconContainer__46773 .pencilIconWrapper__46773,
.embedSuppressButton__623de,
.removeButton_af3987,
.closeButton_e876a8,
.button_e18686,
.clearSearchHistoryIcon__971b5,
.bd-store-card-caret,
.bd-store-card-icon,
.bd-addon-list .bd-footer .bd-link svg,
.bd-addon-header .bd-icon,
.caret_dc2e44,
.detailsIcon__4a3a5,
.caret_e34850,
.channelIcon__28e57,
.linkIcon_a4b5f8,
.badge__91f7b,
.rsvpIcon_b5010b,
.autocompleteQuerySymbol_ac6cb0,
.icon__4a3a5,
.circleIconButton__5bc7e,
.icon__07f91:not(.iconServer__07f91,.strikethrough__07f91),
.caret_c1e9c4,
.iconLayout__0c4c4:hover .clear__0c4c4,
.icon__0c4c4,
.raisedHandCount__15cd2,
.bd-addon-title svg,
.collapseButton__427f0,
.trashIcon_e4772e,
.bd-addon-error-icon svg,
.bd-addon-error-details-icon,
.ruleIcon_c5e6a1,
.actionIcon_bc4513,
.actionIcon__6446f,
.radioItemIcon__64e61,
.channelContainer__88264,
.channelIcon_d5f3cd,
.mentionLimitIcon_ed9c90,
.preview__05e8e,
.channelIcon__6ae25,
.linkIcon__352b7,
.overflowMenuIcon_a27e58,
.theme-dark .iconForeground__37e49 {
	color: var(--primary) !important;
}

.circleIconButton__5bc7e.selected__5bc7e,
.circleIconButton__5bc7e:hover:not(.disabled__5bc7e),
.custom-theme-background .circleIconButton__5bc7e.selected__5bc7e,
.custom-theme-background .circleIconButton__5bc7e:hover:not(.disabled__5bc7e),
.visual-refresh .circleIconButton__5bc7e.selected__5bc7e,
.visual-refresh .circleIconButton__5bc7e:hover:not(.disabled__5bc7e),
.visual-refresh.custom-theme-background .circleIconButton__5bc7e.selected__5bc7e,
.visual-refresh.custom-theme-background .circleIconButton__5bc7e:hover:not(.disabled__5bc7e) {
	color: #fff !important;
}

.childContainer__3e3b0 path[fill="var(--primary-500)"] {
	fill: white;
}

.commentIcon_e1364f path,
.dragHandleButton__62dd3 path,
.dragContainer_b96967 path[fill="currentColor"],
.container__9bb02 path[fill="var(--interactive-icon-default)"],
.channelOptionIcon__4eb6e path,
.headerSubtitleIcon__8a031 path,
.icon__5a838 path,
.icon__88a69 path,
.title_e29cd7 polygon,
.channelIcon__5c799 path,
.headerCollapseIcon__14245 path,
.headerIcon__14245 path,
.joinOptionContent__959cb path,
.tag_cfee8f path,
.uploadIcon__8bb30 path,
.uploadIcon__94439 path,
.menuIcon__62974 path,
.sortDropdownInner_f369db path,
.badgeContainer__635ed path,
.icon__13533 path,
.submenuIconWrapper_ce8328 path[fill="currentColor"],
.menuItemLabel_ce8328 path[fill="var(--interactive-icon-default)"],
.menuItemIcon_ce8328 path[fill="currentColor"],
.favoriteIcon__972a0 path[fill="currentColor"],
.icon__38524 path[fill="currentColor"],
.accountButtonInner__4109d path[fill="currentColor"],
.connectionDelete__4109d path[fill="currentColor"],
.sessionMoreButton_c8ddd4 path[fill="currentColor"],
.actionMenuButton__12cd0 path,
.appDetailsSectionHeader__24605 path,
.iconContainer__416c7 path,
.icon_d9752c path[fill="currentColor"],
.vc-icon:not(.vc-delete-icon,.vc-settings-quickActions-img) path[fill="currentColor"],
.checkbox__09aca path[fill="var(--white)"],
.checkboxIndicator__714a9 path[fill="var(--white)"],
.repliedTextContentTrailingIcon_c19a55 path,
.channelName__35a7e path,
.openFullPreviewSection__4d95d path,
.toggleExpandSection__4d95d path,
.downloadButton__4d95d path,
.codeIcon__4d95d path,
.flowerStar__3e3b0 path[fill="var(--white)"],
.friendRequestsButton__523aa path,
.showAllBadges__5b8f4 path,
.icon__9ee73 path,
.icon__3633a path,
.icon_b28dff path,
.image_e98186 path,
.shield_e98186 path,
.arrow_c3ab2b path,
.plusIcon_b96967 path,
.dragIcon__5d756 path,
.collapseButton__5d756 path,
.chevronIcon__0edde path,
.expand__43dab path,
.channelIcon__4591d path,
.icon__4591d path,
.button__14992 path,
.channelNameIcon_a7e67f path,
.plusIcon__16eb0 path,
.addStatusIcon_ab8609 path,
.icon__2d0ab path,
.editIcon__754bd path,
.editableGdmIconIndicator_ec5bef path,
.frequentFriendsInfoIcon__1fc18 path,
.itemIcon__971b5 path,
.buttonInner_aec7ab path,
.button__71c22 path,
.titleCaret__4914c path,
.emptyChannelIcon__00de6 path,
.slowModeIcon_b21699 path,
.header__095fe path,
.toggleExpandIcon__095fe path,
.closeIcon__972a0 path,
.clickable__1f6ca path,
.button__0f074 path,
.icons_a16aea path,
.groupCollapsedAction__70d86 path,
.clickable__8c853 path,
.icon_c97e55,
.editPencilIcon__2d060 path,
.rowContainer__1e702 path,
.rowContainer__0e124 path,
.icon__8cc9a path,
.iconContainer__0624f path,
.channelIcon__3ddc0 path,
.editProfilesRow_f3be29 path,
.icon_caf372 path[fill="currentColor"],
.overflowIcon__4d95d path[fill="currentColor"],
.languageIcon__4d95d path[fill="currentColor"],
.icon_caf372 circle,
.wishlistButton__80679 path,
.tabWithChevron__80679 path,
.colorDefault_c1e9c4:not(.colorDanger_c1e9c4) .icon_c1e9c4 path,
.text__0d0f9 path,
.colorDefault_c1e9c4:not(.colorDanger_c1e9c4):not(.checkboxContainer_c1e9c4) path:not([fill="var(--red-400)"],[fill="var(--white-500)"],[fill="var(--white)"]),
.colorDefault_c1e9c4:not(.colorDanger_c1e9c4).focused_c1e9c4:not(.checkboxContainer_c1e9c4) path:not([fill="var(--red-400)"],[fill="var(--white-500)"],[fill="var(--white)"]),
.headerBarInner__1a9ce path,
.icon__8a7fc path,
.searchIcon__1ac1c path,
.headerChildren_f37cb1 path,
.icon__0f084 path,
.titleContainer_e8b59c path,
.inviteButton_f37cb1 path,
.title_edbb22 path,
.raisedHandIcon__15cd2 rect,
.raisedHandIcon__15cd2 path,
.icon_d8f25b path,
.arrow_d8f25b path,
.icon__124d2 path,
.anniversarySubtext_fc004c path,
.channelIcon__628e6 path,
.children__9293f path,
.subHeaderContainer__75e8e path,
.icon__1bad5 path,
.clearButton__0edde path,
.navigatorIcon__15430 path,
.nitroWheel__673eb path,
.nitroWheel__0aa03 path,
.nitroWheel_c5f0dc path,
.settingsIcon__61424 path,
.headerIcon__61424 path,
.navigatorTrailing__15430 path,
.icon__64c86 path,
.deviceIcon__12eef path,
.selectedIcon__2e223 path,
.attachmentRow__68334 path,
.closeButton__00843 path,
.icon__76f04 path,
.detailsRowValue_d9246e path,
.colorPickerSwatch__459fb .colorPickerDropper__459fb path,
.innerBottomRowAction__34940 path,
.modInfoItemIcon__96c0b path,
.viewAllPermissions__1ef77 path,
.backButton__15c82 path,
.addRoleIcon__3a5a1 path,
.headerTitle__3a5a1 path,
.closeAction__34940 path,
.channelNameIcon__971b5 path,
.iconContainer__235ca path[fill="currentColor"],
.roleRemoveIcon__48c1c path,
.perm-details-button,
.linkIcon_ebf183 path,
.connectionRoleIcon_af3987 path,
.memberRow__9a73f path,
.stickerCategoryGenericIcon__3ad28 path,
.standardStickerShortcut__3ad28 path,
.iconWrapper__979b1 path,
.addButton_af3987 path,
.person__5f97b path {
	fill: var(--primary) !important;
}

.newspaperIcon__97b5e path[d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"] {
	fill: #008ae6 !important;
}

.newspaperIcon__97b5e {
	stroke: var(--primary) !important;
}

.toggleIconOn__497cd .fill__497cd {
	fill: var(--primary);
}

.bd-button-content svg,
.lucide.icon_caf372,
.spinnerWrapper_ae7890,
.spinnerPath_ae7890 {
	stroke: var(--primary);
}

.raisedHandCount__15cd2,
.badge_c99c29,
.badge__81391,
.iconWrapper__9293f .iconBadge__9293f {
	background-color: #fff !important;
}

.imageContainer_db811b[style="background-color: var(--brand-500);"] {
	background-color: var(--primary) !important;
}

.lottieIconColors__5eb9b :not(defs *)[fill][fill-opacity] {
    fill: var(--__lottieIconColor, var(--primary));
}

.userPopout .bodyInnerWrapper .rolesList {
    .addButton {
        color: var(--primary) !important;
    }
}

.theme-dark :is(.topSectionNormal) {
    & .profileButtons {
        & .bannerButton_fb7f94, & .sm_a22cb0:not(.hasText_a22cb0) {
            svg {
                stroke: var(--primary) !important;
            }
        }
    }
}

.outer_c0bea0.custom-user-profile-theme .topSectionNormal .profileButtons, .outer_c0bea0 .topSectionNormal .profileButtons {
    .sm_a22cb0:not(.hasText_a22cb0),
	.sm_a22cb0:not(.hasText_a22cb0):hover:not(:disabled),
	.sm_a22cb0:not(.hasText_a22cb0):active:not(:disabled) {
        color: var(--primary) !important;
    }
}
            }
        `;
    }
    
    document.head.appendChild(style);
    this.iconStyle = style;
}
    
processCards() {
    const cards = document.querySelectorAll('.accountProfileCard_a27e58');
    cards.forEach(card => {
        if (this.processedCards.has(card)) return;
        
        const maskSvg = card.querySelector('.mask__68edb');
        if (!maskSvg) return;
        
        if (this.settings.styleVersion === '2023') {
            const banner = maskSvg.querySelector('.banner__68edb');
            if (banner) {
                if (!card.querySelector('.banner__68edb')) {
                    card.insertBefore(banner, maskSvg);
                }
            }
        }
        maskSvg.remove();
        this.processedCards.add(card);
        card.setAttribute('data-nocturnal-processed', 'true');
    });
}

processEmptySVG(force = false) {
    if (!this.isRunning) return;
    
    if (force) {
        this.processedEmpty = new WeakSet();
    }
    
    if (!this.processedEmpty) {
        this.processedEmpty = new WeakSet();
    }
    
    const svgElements = document.querySelectorAll('svg.empty__99e7c');
    
    svgElements.forEach(svg => {
        if (this.processedEmpty.has(svg)) return;
        
        const circles = svg.querySelectorAll('circle');
        
        circles.forEach(circle => {
            if (circle.hasAttribute('data-replaced')) return;
            
            const cx = parseFloat(circle.getAttribute('cx')) || 16;
            const cy = parseFloat(circle.getAttribute('cy')) || 16;
            const r = parseFloat(circle.getAttribute('r')) || 16;
            const originalOpacity = circle.getAttribute('opacity');
            const originalFill = circle.getAttribute('fill');
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', cx - r);
            rect.setAttribute('y', cy - r);
            rect.setAttribute('width', r * 2);
            rect.setAttribute('height', r * 2);
            rect.setAttribute('fill', originalFill || 'currentColor');
            rect.setAttribute('rx', '10');
            rect.setAttribute('ry', '10');
            
            rect.setAttribute('data-original-circle', 'true');
            rect.setAttribute('data-cx', cx);
            rect.setAttribute('data-cy', cy);
            rect.setAttribute('data-r', r);
            rect.setAttribute('data-replaced', 'true');
            
            if (originalOpacity !== null) {
                rect.setAttribute('opacity', originalOpacity);
                rect.setAttribute('data-opacity', originalOpacity);
            }
            
            circle.parentNode.replaceChild(rect, circle);
        });
        
        const rects = svg.querySelectorAll('rect:not([data-replaced])');
        rects.forEach(rect => {
            const height = parseFloat(rect.getAttribute('height')) || 20;
            rect.setAttribute('rx', height / 2);
            rect.setAttribute('ry', height / 2);
            rect.setAttribute('data-replaced', 'true');
        });
        
        this.processedEmpty.add(svg);
    });
}

processRoleDots() {
    if (!this.isRunning) return;
    
    if (!this.processedRoleDots) {
        this.processedRoleDots = new WeakSet();
    }
    
    const roleDots = document.querySelectorAll('.roleDot_af3987 circle, .roleDot__48c1c circle, .dotBorderColor__4f569, .dot__4f569, .dotBorderBase__4f569, [class*="roleDot"] circle, [class*="dot"] circle');
    
    roleDots.forEach(circle => {
        if (this.processedRoleDots.has(circle)) return;
        
        const cx = circle.getAttribute('cx');
        const cy = circle.getAttribute('cy');
        const r = circle.getAttribute('r');
        const fill = circle.getAttribute('fill');
        const className = circle.getAttribute('class');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        
        if (cx) rect.setAttribute('x', parseFloat(cx) - parseFloat(r));
        if (cy) rect.setAttribute('y', parseFloat(cy) - parseFloat(r));
        if (r) {
            rect.setAttribute('width', parseFloat(r) * 2);
            rect.setAttribute('height', parseFloat(r) * 2);
        }
        if (fill) rect.setAttribute('fill', fill);
        if (className) rect.setAttribute('class', className);

        rect.setAttribute('rx', '50');
        rect.setAttribute('ry', '50');
        
        rect.setAttribute('data-nocturnal-restore', 'true');
        if (cx) rect.setAttribute('data-cx', cx);
        if (cy) rect.setAttribute('data-cy', cy);
        if (r) rect.setAttribute('data-r', r);
        if (className) rect.setAttribute('data-class', className);
        
        this.processedRoleDots.add(circle);
        
        circle.parentNode.replaceChild(rect, circle);
    });
}

processIconAccessoryCircles() {
    if (!this.isRunning) return;
    
    if (!this.processedIconAccessory) {
        this.processedIconAccessory = new WeakSet();
    }
    
    const iconAccessories = document.querySelectorAll('.iconAccessory__56a50');
    
    iconAccessories.forEach(container => {
        const svg = container.querySelector('svg');
        if (!svg) return;
        
        if (this.processedIconAccessory.has(svg)) return;
        
        const circles = svg.querySelectorAll('circle');
        
        circles.forEach(circle => {
            if (circle.hasAttribute('data-converted')) return;
            
            const cx = parseFloat(circle.getAttribute('cx')) || 0;
            const cy = parseFloat(circle.getAttribute('cy')) || 0;
            const r = parseFloat(circle.getAttribute('r')) || 0;
            const fill = circle.getAttribute('fill') || 'currentColor';
            const className = circle.getAttribute('class') || '';
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', cx - r);
            rect.setAttribute('y', cy - r);
            rect.setAttribute('width', r * 2);
            rect.setAttribute('height', r * 2);
            rect.setAttribute('fill', fill);
            rect.setAttribute('rx', '50');
            rect.setAttribute('ry', '50');
            if (className) rect.setAttribute('class', className);
            
            rect.setAttribute('data-original-circle', 'true');
            rect.setAttribute('data-cx', cx);
            rect.setAttribute('data-cy', cy);
            rect.setAttribute('data-r', r);
            rect.setAttribute('data-converted', 'true');
            
            circle.parentNode.replaceChild(rect, circle);
        });
        
        this.processedIconAccessory.add(svg);
    });
}

processMaskCircles() {
    const masks = document.querySelectorAll('.mask__68edb mask, .bd-gp-modal mask');
    masks.forEach(mask => {
        if (mask.querySelector('.nocturnal-mask-rect')) return;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('fill', 'black');
        rect.setAttribute('data-nocturnal-mask-rect', 'true');
        mask.appendChild(rect);
    });
}
    
getSettingsPanel() {
    if (!FormSwitch) {
        FormSwitch = betterdiscord.Webpack.getBulk({
            filter: betterdiscord.Webpack.Filters.byStrings('"data-toggleable-component":"switch"', 'layout:"horizontal"'),
            searchExports: true
        })[0];
    }
    
    const SettingsPanel = () => {
        const [oldStyle, setOldStyle] = react.useState(this.settings.styleVersion === '2021');
        const [colorizeIcons, setColorizeIcons] = react.useState(this.settings.colorizeIcons || false);
        
        const handleOldStyleChange = (value) => {
            this.settings.styleVersion = value ? '2021' : '2023';
            this.saveSettings();
            setOldStyle(value);
        };
        
        const handleColorizeChange = (value) => {
            this.settings.colorizeIcons = value;
            this.saveSettings();
            setColorizeIcons(value);
        };
        
        return react.createElement(
            'div',
            { className: 'settingsContainer', style: { padding: '16px' } },
            react.createElement(FormSwitch, {
                label: 'Old Style (before 05.2021)',
                note: 'Switch to the old elements styles before 05.2021',
                checked: oldStyle,
                onChange: handleOldStyleChange
            }),
            react.createElement(FormSwitch, {
                label: 'Colorize Icons',
                note: 'Change gray icons to blue (primary color)',
                checked: colorizeIcons,
                onChange: handleColorizeChange
            })
        );
    };
    
    return react.createElement(SettingsPanel);
}
    
    refresh() {
        if (!this.isRunning) return;
        this.processedRoleDots = new WeakSet();
        this.processedEmpty = new WeakSet();
        this.processedMasks = new WeakSet();
        this.processIconAccessoryCircles = new WeakSet();
        this.processRoleDots();
        this.processEmptySVG();
        this.processMaskCircles();
        this.processIconAccessoryCircles();
        if (this.iconStyle) {
            this.iconStyle.remove();
            this.iconStyle = null;
        }
        this.injectIconStyles();
    }
    
    destroy() {
        this.stop();
    }
}

module.exports = Nocturnal;
