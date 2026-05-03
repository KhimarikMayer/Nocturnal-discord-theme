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
        this.processedServerBadges = new WeakSet();
        this.originalCardData = new Map();
        this.settings = {
            styleVersion: '2023',
            colorizeIcons: true
        };
        this.loadSettings();
    }

    start() {
        this.isRunning = true;
        this.originalCardData.clear();
        this.injectStyles();
        this.injectIconStyles();
        this.processedServerBadges = new WeakSet();
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

        if (this.settings.styleVersion === '2021') {
            this.processServerBadges();
        }

        setTimeout(() => {
            this.processPathToRect();
        }, 0);

        this.interval = setInterval(() => {
            if (!this.isRunning) return;
            this.processRoleDots();
            this.processEmptySVG();
            this.processMaskCircles();
            this.processIconAccessoryCircles();
            if (this.settings.styleVersion === '2021') {
                this.processServerBadges();
            }
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
                            if (this.settings.styleVersion === '2021') {
                                if (node.matches && node.matches('.upperBadge_cc5dd2, .lowerBadge_cc5dd2, [class*="serverbadgeforcircleversion"]')) {
                                    this.processServerBadges();
                                }
                                if (node.querySelectorAll) {
                                    const badges = node.querySelectorAll('.upperBadge_cc5dd2, .lowerBadge_cc5dd2, [class*="serverbadgeforcircleversion"]');
                                    if (badges.length) this.processServerBadges();
                                }
                            }
                        }
                    }
                }
            }
            this.processPathToRect();
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    processServerBadges() {
    if (!this.isRunning) return;
    
    if (this.settings.styleVersion !== '2021') return;
    
    if (!this.processedServerBadges) {
        this.processedServerBadges = new WeakSet();
    }
    
    const upperBadges = document.querySelectorAll('.upperBadge_cc5dd2');
    const lowerBadges = document.querySelectorAll('.lowerBadge_cc5dd2');
    const circleBadges = document.querySelectorAll('[class*="serverbadgeforcircleversion"]');
    
    upperBadges.forEach(badge => {
        if (this.processedServerBadges.has(badge)) return;
        
        badge.style.transform = 'scale(1.05)';
        badge.style.transition = 'transform 0.2s ease';
        badge.classList.add('nocturnal-old-server-badge');
        
        this.processedServerBadges.add(badge);
    });
    
    lowerBadges.forEach(badge => {
        if (this.processedServerBadges.has(badge)) return;
        
        badge.style.transform = 'scale(1.05)';
        badge.style.transition = 'transform 0.2s ease';
        badge.classList.add('nocturnal-old-server-badge');
        
        this.processedServerBadges.add(badge);
    });
    
    circleBadges.forEach(badge => {
        if (this.processedServerBadges.has(badge)) return;
        
        badge.style.borderRadius = '50%';
        badge.style.overflow = 'hidden';
        badge.classList.add('nocturnal-circle-badge');
        
        this.processedServerBadges.add(badge);
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

        const rects = document.querySelectorAll('rect[data-converted-to-rect="true"]');
        rects.forEach(rect => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', rect.getAttribute('data-original-path-d') || 'M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z');
            path.setAttribute('fill', rect.getAttribute('fill') || 'currentColor');
            path.setAttribute('class', rect.getAttribute('class') || '');
            rect.parentNode.replaceChild(path, rect);
        });
        const oldBadges = document.querySelectorAll('.upperBadge_cc5dd2, .lowerBadge_cc5dd2, [class*="serverbadgeforcircleversion"]');
        oldBadges.forEach(badge => {
            badge.style.transform = '';
            badge.style.transition = '';
            badge.style.borderRadius = '';
            badge.style.overflow = '';
            badge.classList.remove('nocturnal-old-server-badge', 'nocturnal-circle-badge');
        });
        this.processedServerBadges = new WeakSet();
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
        if (this.settings.styleVersion === '2021') {
            const oldBadges = document.querySelectorAll('.upperBadge_cc5dd2, .lowerBadge_cc5dd2, [class*="serverbadgeforcircleversion"]');
            oldBadges.forEach(badge => {
                badge.style.transform = '';
                badge.style.transition = '';
                badge.style.borderRadius = '';
                badge.style.overflow = '';
                badge.classList.remove('nocturnal-old-server-badge', 'nocturnal-circle-badge');
            });
            this.processedServerBadges = new WeakSet();
        }
    }

    loadSettings() {
        try {
            const saved = betterdiscord.Data.load('settings');
            if (saved) {
                if (saved.styleVersion) this.settings.styleVersion = saved.styleVersion;
                if (saved.colorizeIcons !== undefined) this.settings.colorizeIcons = saved.colorizeIcons;
            }
            if (this.settings.styleVersion === '2023' && this.settings.colorizeIcons === undefined) {
                this.settings.colorizeIcons = true;
            }
        } catch (e) { }
    }

    saveSettings() {
        try {
            betterdiscord.Data.save('settings', {
                styleVersion: this.settings.styleVersion,
                colorizeIcons: this.settings.colorizeIcons
            });
        } catch (e) { }
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
        style.textContent = '.icon_d2d51d, .vc-mentionAvatars-icon, .icon_b75563 {margin-bottom: .2rem !important;}.roleIcon_af3987 {margin-top: -2px !important;}.accountProfileCard_a27e58 .avatar_a27e58{background-color:var(--backgroundDarker) !important;border:7px solid var(--backgroundDarker) !important;top:75px !important;inset-inline-start:15px !important;}';
    } else {
        style.textContent = '@import url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/old-whitney-font.css"); .row__1bad5 {border-radius: 5px;} html:not(.custom-theme-background).theme-dark:not(.theme-darker, .theme-midnight), html:not(.custom-theme-background) .theme-dark:not(.theme-darker, .theme-midnight) { --autocomplete-bg: color-mix(in oklab, var(--primary-630) 100%, var(--theme-base-color, #000) var(--theme-base-color-amount, 0%)); --chat-background-default: hsl(218, calc(var(--saturation-factor, 1) * 8%), 27%); --header-primary: var(--white-500); --channels-default: #8e9297; --primary-500: hsl(217, calc(var(--saturation-factor, 1) * 8%), 34%); --primary-600: hsl(220, calc(var(--saturation-factor, 1) * 8%), 23%); --primary-630: hsl(223, calc(var(--saturation-factor, 1) * 7%), 20%); --primary-660: hsl(220, calc(var(--saturation-factor, 1) * 7%), 17%); --primary-700: hsl(216, calc(var(--saturation-factor, 1) * 7%), 14%); --primary-800: hsl(220, calc(var(--saturation-factor, 1) * 8%), 10%); --interactive-muted: var(--primary-500); --background-primary: var(--primary-600); --modal-background: var(--background-primary); --background-secondary: var(--primary-630); --background-secondary-alt: var(--primary-660); --background-tertiary: var(--primary-700); --background-accent: var(--primary-500); --background-floating: var(--primary-800); --background-mod-subtle: hsla(217, calc(var(--saturation-factor, 1) * 8%), 34%, 0.16); --background-mod-muted: hsla(217, calc(var(--saturation-factor, 1) * 8%), 34%, 0.24); --background-mod-strong: hsla(217, calc(var(--saturation-factor, 1) * 8%), 34%, 0.32); --background-modifier-accent: oklch(100% 0.00011 271.152 / 0.06); --background-mentioned: hsla(38, calc(var(--saturation-factor, 1) * 96%), 54%, 0.051); --background-mentioned-hover: hsla(38, calc(var(--saturation-factor, 1) * 96%), 54%, 0.078); --background-message-hover: hsla(240, calc(var(--saturation-factor, 1) * 11%), 2%, 0.07); --background-help-warning: hsla(38, calc(var(--saturation-factor, 1) * 96%), 54%, 0.102); --background-help-info: hsla(197, calc(var(--saturation-factor, 1) * 100%), 48%, 0.1); --scrollbar-thin-thumb: var(--primary-700); --scrollbar-thin-track: transparent; --scrollbar-auto-thumb: var(--primary-700); --scrollbar-auto-track: var(--primary-630); --scrollbar-auto-scrollbar-color-thumb: var(--primary-700); --scrollbar-auto-scrollbar-color-track: var(--primary-630); --elevation-stroke: 0 0 0 1px hsla(240, calc(var(--saturation-factor, 1) * 11%), 2%, 0.15); --elevation-low: 0 1px 0 hsla(240, calc(var(--saturation-factor, 1) * 11%), 2%, 0.2), 0 1.5px 0 hsla(240, calc(var(--saturation-factor, 1) * 8%), 3%, 0.05), 0 2px 0 hsla(240, calc(var(--saturation-factor, 1) * 11%), 2%, 0.05); --elevation-medium: 0 4px 4px hsla(0, 0%, 0%, 0.16); --elevation-high: 0 8px 16px hsla(0, 0%, 0%, 0.24); --icon-primary: var(--interactive-text-default); --legacy-elevation-low: 0 1px 5px 0 hsl(var(--black-500-hsl) / 0.3); --legacy-elevation-high: 0 2px 10px 0 hsl(var(--black-500-hsl) / 0.2); --legacy-elevation-border: 0 0 0 1px hsl(var(--primary-700-hsl) / 0.6); --logo-primary: var(--white-500); --focus-primary: var(--brand-experiment); --deprecated-card-bg: hsla(216, calc(var(--saturation-factor, 1) * 7%), 15%, 0.6); --deprecated-card-editable-bg: hsla(216, calc(var(--saturation-factor, 1) * 7%), 15%, 0.3); --deprecated-store-bg: var(--background-primary); --deprecated-quickswitcher-input-background: var(--text-muted); --deprecated-quickswitcher-input-placeholder: hsla(0, 0%, 100%, 0.3); --input-background-default: hsla(0, 0%, 0%, 0.2); --input-border-default: hsla(0, 0%, 0%, 0.35); --input-border-hover: hsl(240, 11%, 2%); --input-border-disabled: var(--primary-700); --deprecated-text-input-prefix: #dcddde; --button-secondary: var(--primary-500); --button-secondary-hover: var(--text-muted); --button-secondary-active: var(--text-muted); --primary-transparent: hsla(0, 0%, 100%, 0.1); --search-popout-option-user-nickname: var(--text-default); --search-popout-option-user-username: var(--text-muted); --search-popout-option-filter-text: var(--primary-400); --search-popout-option-non-text-color: #caccce; --search-popout-option-filter-color: #caccce; --search-popout-option-answer-color: #caccce; --search-popout-date-picker-border: 1px solid hsl(228 calc(1 * 6.667%) 14.706% /0.3); --search-popout-date-picker-hint-text: #caccce; --search-popout-date-picker-hint-value-text: #fff; --search-popout-date-picker-hint-value-background: var(--brand-500); --search-popout-date-picker-hint-value-background-hover: var(--brand-430); --shadow-button-overlay: 0 12px 24px 0 hsl(none 0% 0%/0.24); --shadow-button-overlay-filter: drop-shadow(0 12px 24px hsl(none 0% 0%/0.24)); --shadow-ledge: 0 2px 0 0 hsl(none 0% 0%/0.05), 0 1.5px 0 0 hsl(none 0% 0%/0.05), 0 1px 0 0 hsl(none 0% 0%/0.16); --shadow-ledge-filter: drop-shadow(0 1.5px 0 hsl(none 0% 0%/0.24)); --shadow-low: 0 1px 4px 0 hsl(none 0% 0%/0.14); --shadow-low-filter: drop-shadow(0 1px 4px hsl(none 0% 0%/0.14)); --shadow-low-active: 0 0 4px 0 hsl(none 0% 0%/0.14); --shadow-low-active-filter: drop-shadow(0 0 4px hsl(none 0% 0%/0.14)); --shadow-low-hover: 0 4px 10px 0 hsl(none 0% 0%/0.14); --shadow-low-hover-filter: drop-shadow(0 4px 10px hsl(none 0% 0%/0.14)); --shadow-medium: 0 4px 8px 0 hsl(none 0% 0%/0.16); --shadow-medium-filter: drop-shadow(0 4px 8px hsl(none 0% 0%/0.16)); --shadow-mobile-navigator-x: 0 0 10px 0 hsl(none 0% 0%/0.22); --shadow-mobile-navigator-x-filter: drop-shadow(0 0 10px hsl(none 0% 0%/0.22)); --shadow-top-high: 0 -12px 32px 0 hsl(none 0% 0%/0.24); --shadow-top-high-filter: drop-shadow(0 -12px 32px hsl(none 0% 0%/0.24)); --shadow-top-ledge: 0 -2px 0 0 hsl(none 0% 0%/0.05), 0 -1.5px 0 0 hsl(none 0% 0%/0.05), 0 -1px 0 0 hsl(none 0% 0%/0.16); --shadow-top-ledge-filter: drop-shadow(0 -1.5px 0 hsl(none 0% 0%/0.24)); --shadow-top-low: 0 -1px 4px 0 hsl(none 0% 0%/0.14); --shadow-top-low-filter: drop-shadow(0 -1px 4px hsl(none 0% 0%/0.14)); --info-positive-foreground: var(--green); --text-positive: var(--green); --status-positive-background: var(--green); --button-danger-background-active: var(--red-active); --button-danger-background: var(--red); --text-feedback-critical: var(--red); --text-danger: var(--red); --info-danger-foreground: var(--red); --status-danger-background: var(--red); --font-display: var(--font-primary); --control-brand-foreground: var(--brand-experiment); --notice-background-warning: #f26522; --notice-text-warning: #fff; --notice-background-critical: #f23f42; --notice-text-critical: #fff; --notice-background-info: var(--blurple); --notice-text-info: #fff; --icon-feedback-critical: var(--notice-background-critical); --background-surface-high: var(--background-secondary); --control-background-active-default: var(--green); --control-background-active-hover: var(--green-hover); --control-background-active-active: var(--green-active); --control-text-active-default: var(--white); --badge-background-default: var(--blurple); --badge-background-brand: var(--blurple); } :root { --oldcord-tint: 210; --oldcord-tint-intensity: 11.11; --font-primary: Whitney, "Helvetica Neue", "gg sans", Helvetica, Arial, sans-serif; --font-display: var(--font-primary); --font-headline: var(--font-primary); --font-display: var(--font-primary); --font-code: Consolas, "source code pro", "noto sans mono", "gg code", monospace; --blurple: var(--brand-experiment); --blurple-hover: hsl(227, calc(var(--saturation-factor, 1) * 44%), 59%); --blurple-active: hsl(226, calc(var(--saturation-factor, 1) * 34%), 52%); --blurple-inverted: #fff; --blurple-inverted-hover: hsl(228, calc(var(--saturation-factor, 1) * 56%), 98%); --blurple-inverted-active: hsl(229, calc(var(--saturation-factor, 1) * 60%), 93%); --text-brand: var(--blurple); --brand-260: var(--brand-experiment-260); --brand-360: var(--brand-experiment-360); --brand-460: var(--brand-experiment-460); --brand-500: var(--brand-experiment); --brand-new-500: var(--blurple); --brand-530: var(--brand-experiment-530); --brand-560: var(--brand-experiment-560); --brand-new-560: var(--brand-560); --brand-600: var(--brand-experiment-600); --brand-experiment-100: hsl(228, calc(var(--saturation-factor, 1) * 56%), 98%); --brand-experiment-130: hsl(228, calc(var(--saturation-factor, 1) * 63%), 97%); --brand-experiment-160: hsl(228, calc(var(--saturation-factor, 1) * 60%), 95%); --brand-experiment-200: hsl(229, calc(var(--saturation-factor, 1) * 60%), 93%); --brand-experiment-230: hsl(227, calc(var(--saturation-factor, 1) * 57%), 91%); --brand-experiment-260: hsl(226, calc(var(--saturation-factor, 1) * 59%), 89%); --brand-experiment-300: hsl(227, calc(var(--saturation-factor, 1) * 58%), 86%); --brand-experiment-330: hsl(227, calc(var(--saturation-factor, 1) * 59%), 82%); --brand-experiment-360: hsl(227, calc(var(--saturation-factor, 1) * 58%), 78%); --brand-experiment-400: hsl(226, calc(var(--saturation-factor, 1) * 58%), 72%); --brand-experiment-430: hsl(227, calc(var(--saturation-factor, 1) * 58%), 70%); --brand-experiment-460: hsl(227, calc(var(--saturation-factor, 1) * 59%), 68%); --brand-experiment: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%); --brand-experiment-500: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%); --brand-experiment-530: hsl(227, calc(var(--saturation-factor, 1) * 45%), 59%); --brand-experiment-560: hsl(227, calc(var(--saturation-factor, 1) * 35%), 53%); --brand-experiment-600: hsl(227, calc(var(--saturation-factor, 1) * 31%), 44%); --brand-experiment-630: hsl(226, calc(var(--saturation-factor, 1) * 31%), 38%); --brand-experiment-660: hsl(226, calc(var(--saturation-factor, 1) * 31%), 34%); --brand-experiment-700: hsl(227, calc(var(--saturation-factor, 1) * 31%), 26%); --brand-experiment-730: hsl(228, calc(var(--saturation-factor, 1) * 31%), 25%); --brand-experiment-760: hsl(227, calc(var(--saturation-factor, 1) * 32%), 22%); --brand-experiment-800: hsl(226, calc(var(--saturation-factor, 1) * 31%), 19%); --brand-experiment-830: hsl(225, calc(var(--saturation-factor, 1) * 32%), 15%); --brand-experiment-860: hsl(225, calc(var(--saturation-factor, 1) * 32%), 10%); --brand-experiment-900: hsl(228, calc(var(--saturation-factor, 1) * 29%), 3%); --brand-experiment-05a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 5%); --brand-experiment-10a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 10%); --brand-experiment-15a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 15%); --brand-experiment-20a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 20%); --brand-experiment-25a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 25%); --brand-experiment-30a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 30%); --brand-experiment-35a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 35%); --brand-experiment-40a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 40%); --brand-experiment-45a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 45%); --brand-experiment-50a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 50%); --brand-experiment-55a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 55%); --brand-experiment-60a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 60%); --brand-experiment-65a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 65%); --brand-experiment-70a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 70%); --brand-experiment-75a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 75%); --brand-experiment-80a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 80%); --brand-experiment-85a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 85%); --brand-experiment-90a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 90%); --brand-experiment-95a: hsl(227, calc(var(--saturation-factor, 1) * 58%), 65%, 95%); --blurple-50: var(--brand-500); --blurple-60: var(--brand-600); --red-inverted: hsl(0, calc(var(--saturation-factor, 1) * 80%), 98%); --red-inverted-active: hsl(0, calc(var(--saturation-factor, 1) * 85%), 92%); --yellow: hsl(38, calc(var(--saturation-factor, 1) * 96%), 54%); --yellow-hover: hsl(37, 81%, 49%); --yellow-active: hsl(37, 81%, 44%); --yellow-inverted: #fffbf4; --yellow-inverted-active: #feedd1; --yellow-360: var(--yellow); --status-yellow-560: var(--yellow); --green-inverted: #f6fbf9; --green-inverted-active: #d9f0e6; --green: hsl(153, calc(var(--saturation-factor, 1) * 46%), 49%); --green-hover: hsl(153, calc(var(--saturation-factor, 1) * 46%), 44%); --green-active: hsl(152, calc(var(--saturation-factor, 1) * 46%), 39%); --green-transparent: hsl(153, calc(var(--saturation-factor, 1) * 46%), 49%, 20%); --control-background-active-default: var(--green); --control-background-active-hover: var(--green-hover); --control-background-active-active: var(--green-active); --button-positive-background: var(--green); --status-green-600: var(--green); --green-360: var(--green); --info-positive-foreground: var(--green); --text-positive: var(--green); --status-positive-background: var(--green); --blue-345: hsl(199.524 calc(1 * 100%) 49.412% /1); --red: hsl(0deg, calc(var(--saturation-factor, 1) * 85%), 61%); --red-hover: hsl(0deg, calc(var(--saturation-factor, 1) * 66%), 55%); --red-active: hsl(0deg, calc(var(--saturation-factor, 1) * 54%), 49%); --red-transparent: hsl(0, calc(var(--saturation-factor, 1) * 85%), 61%, 10%); --button-danger-background-active: var(--red-active); --button-danger-background: var(--red); --text-danger: var(--red); --info-danger-foreground: var(--red); --status-danger-background: var(--red); --control-brand-foreground: var(--brand-experiment); --bdfdb-green: var(--green); --text-warning: hsl(40 calc(var(--saturation-factor, 1) * 86.4%) 56.9%/1); --notice-background-warning: #f26522; --notice-text-warning: #fff; --notice-background-critical: #f23f42; --notice-text-critical: #fff; --notice-background-info: var(--blurple); --notice-text-info: #fff; --background-surface-high: var(--background-secondary); --bg-base-secondary: var(--background-secondary); --control-text-active-default: var(--white); --twitch-dark: hsl(262, calc(var(--saturation-factor, 1) * 47%), 36%); --twitch: hsl(262, calc(var(--saturation-factor, 1) * 47%), 40%); --youtube-dark: hsl(0, calc(var(--saturation-factor, 1) * 73%), 41%); --youtube: hsl(0deg, calc(var(--saturation-factor, 1) * 73%), 46%); --spotify: hsl(141, calc(var(--saturation-factor, 1) * 72%), 42%); --spotify-dark: hsl(141, calc(var(--saturation-factor, 1) * 72%), 40%); --xbox-dark: hsl(120, calc(var(--saturation-factor, 1) * 77%), 26%); --xbox2: hsl(120, calc(var(--saturation-factor, 1) * 77%), 27%); --playstation-dark: hsl(220, calc(var(--saturation-factor, 1) * 96%), 27%); --playstation2: hsl(220, calc(var(--saturation-factor, 1) * 96%), 31%); --crunchyroll-dark: hsl(29, calc(var(--saturation-factor, 1) * 93%), 55%); --crunchyroll: hsl(29, calc(var(--saturation-factor, 1) * 93%), 60%); --text-link: color-mix(in oklab, var(--blue-345) 100%, var(--theme-text-color, #000) var(--theme-text-color-amount, 0%)); --progressbar-indicator-background: var(--blurple); } .cardPrimary__73069 { --__card-accent-color: var(--background-secondary) !important; } .colorDefault__6e2b9, .colorSuccess__6e2b9 { --custom-notice-background: var(--status-positive-background); --custom-notice-text: var(--status-positive-text); --custom-notice-button-hover: var(--status-positive-background); } .colorDanger__6e2b9 { --custom-notice-background: var(--status-danger-background) !important; --custom-notice-text: var(--status-danger-text) !important; --custom-notice-button-hover: var(--text-danger) !important; } :root { --custom-channel-header-height: 48px; --custom-member-list-width: 240px; --custom-guild-list-width: 72px; --custom-guild-sidebar-width: 375px; --custom-app-panels-height: 52.984375px; --custom-add-permissions-modal-focus-ring-width: 4px; --custom-custom-role-icon-form-item-role-icon-preview-size: 32px; --custom-guild-settings-roles-edit-shared-sidebar-width: 232px; --custom-guild-settings-roles-intro-roles-transition: 250ms; --custom-guild-settings-roles-intro-pause-transition: 166ms; --custom-guild-settings-roles-intro-background-transition: 500ms; --custom-guild-settings-roles-intro-banner-transition-delay: calc(var(--custom-guild-settings-roles-intro-roles-transition) + var(--custom-guild-settings-roles-intro-pause-transition)); --custom-guild-settings-roles-intro-roles-transition-delay: calc(var(--custom-guild-settings-roles-intro-roles-transition) + var(--custom-guild-settings-roles-intro-pause-transition) * 2 + var(--custom-guild-settings-roles-intro-background-transition)); --custom-guild-settings-community-intro-content-spacing: 32px; --custom-guild-settings-community-intro-hover-distance: -12px; --custom-guild-settings-community-intro-text-spacing: 8px; --custom-guild-settings-discovery-landing-page-max-width-tab: 905px; --custom-guild-settings-discovery-landing-page-settings-max-width: 520px; --custom-guild-settings-partner-content-spacing: 32px; --custom-event-detail-info-tab-base-spacing: 8px; --custom-subscription-listing-previews-carousel-cards-get-cut-off-width: 724px; --custom-editable-benefits-list-emoji-size: 24px; --custom-edit-benefit-modal-emoji-size: 22px; --custom-edit-benefit-modal-emoji-margin: 10px; --custom-guild-settings-role-subscriptions-max-width: 905px; --custom-guild-settings-role-subscriptions-overview-settings-max-width: 520px; --custom-guild-settings-store-page-settings-max-width: 520px; --custom-importable-benefits-list-listing-image-size: 40px; --custom-import-benefits-modal-icon-size: 24px; --custom-import-benefits-modal-role-icon-size: 40px; --custom-role-icon-uploader-icon-size: 24px; --custom-guild-role-subscription-style-constants-cover-image-aspect-ratio: 4; --custom-historic-earnings-table-toggle-expand-column-width: 30px; --custom-guild-role-subscription-card-basic-info-tier-image-size: 80px; --custom-guild-role-subscription-card-basic-info-tier-image-size-mobile: 48px; --custom-guild-role-subscriptions-overview-page-page-max-width: 1180px; --custom-guild-dialog-popout-width: 250px; --custom-guild-dialog-splash-ratio: 1.77778; --custom-guild-dialog-icon-size: 84px; --custom-guild-dialog-icon-padding: 4px; --custom-guild-product-download-modal-header-image-width: 119px; --custom-guild-onboarding-home-page-max-page-width: 1128px; --custom-guild-onboarding-home-page-max-single-column-width: 704px; --custom-home-resource-channels-obscured-blur-radius: 20px; --custom-guild-member-application-review-sidebar-width: 29vw; --custom-featured-items-popout-featured-items-popout-footer-height: 120px; --custom-guild-boosting-sidebar-display-conditional-bottom-margin: 12px; --custom-guild-boosting-marketing-progress-bar-marker-dimensions: 32px; --custom-guild-boosting-marketing-progress-bar-end-markers-margin: 4px; --custom-guild-boosting-marketing-progress-bar-marker-marker-dimensions: 32px; --custom-guild-boosting-marketing-tier-cards-tier-card-border-radius: 16px; --custom-go-live-modal-art-height: 112px; --custom-gif-picker-gutter-size: 0 16px 12px 16px; --custom-gif-picker-search-results-desired-item-width: 160px; --custom-forum-composer-attachments-attachment-size: 78px; --custom-forum-post-obscured-blur-radius: 20px; --custom-forum-post-grid-view-obscured-blur-radius: 20px; --custom-demo-forum-channel-padding-large: 20px; --custom-demo-forum-channel-post-padding: 12px; --custom-demo-forum-channel-gap-size: 8px; --custom-feedback-modal-emoji-size: 64px; --custom-feedback-modal-close-button-margin: 12px; --custom-expression-suggestions-container-padding: 8px; --custom-expression-suggestions-sticker-suggestion-size: 48px; --custom-expression-suggestions-sticker-suggestion-margin: 8px; --custom-expression-picker-constants-expression-picker-list-section-heading-height: 32px; --custom-expression-picker-constants-expression-picker-inspector-bar-graphic-primary-dimensions: 28px; --custom-expression-picker-constants-expression-picker-inspector-bar-graphic-secondary-dimensions: 32px; --custom-expression-picker-constants-expression-picker-inspector-bar-height: 48px; --custom-emoji-picker-border-radius: 8px; --custom-emoji-picker-constants-min-emoji-picker-width: 498px; --custom-emoji-picker-constants-emoji-size-medium: 40px; --custom-emoji-picker-constants-emoji-size-large: 48px; --custom-emoji-picker-constants-emoji-container-padding-horizontal: 4px; --custom-emoji-picker-constants-emoji-container-padding-vertical: 4px; --custom-emoji-picker-constants-emoji-picker-height: 440px; --custom-emoji-picker-constants-emoji-section-margin-bottom: 12px; --custom-emoji-picker-constants-emoji-list-padding-top: 0; --custom-emoji-picker-constants-emoji-list-padding-right: 0; --custom-emoji-picker-constants-emoji-list-padding-bottom: 8px; --custom-emoji-picker-constants-emoji-list-padding-left: 8px; --custom-emoji-picker-constants-emoji-list-search-results-padding-top: 8px; --custom-emoji-picker-constants-unicode-category-icon-margin-vertical: 2px; --custom-emoji-picker-constants-unicode-category-icon-size: 24px; --custom-emoji-picker-constants-unicode-category-icon-padding: 4px; --custom-emoji-picker-constants-unicode-category-shortcut-height: 48px; --custom-emoji-picker-constants-guild-category-icon-size: 32px; --custom-emoji-picker-constants-guild-category-icon-margin-verical: 8px; --custom-emoji-picker-constants-category-separator-size: 1px; --custom-emoji-picker-constants-category-separator-margin-vertical: 12px; --custom-emoji-picker-constants-diversity-emoji-size: 24px; --custom-emoji-picker-constants-emoji-premium-upsell-height: 54px; --custom-emoji-picker-constants-emoji-premium-upsell-margin-top: 16px; --custom-emoji-picker-constants-newly-added-emoji-badge-height: 16px; --custom-discover-static-guild-card-card-height: 258px; --custom-discover-featured-guilds-section-card-height: 320px; --custom-discover-featured-guilds-section-min-card-width: 248px; --custom-discover-featured-guilds-section-gutter-size: 16px; --custom-discover-search-results-max-search-bar-width: 720px; --custom-guild-directory-min-card-width: 248px; --custom-guild-directory-gutter-size: 16px; --custom-guild-directory-min-content-width: 320px; --custom-guild-directory-max-page-width: 1608px; --custom-guild-directory-entry-card-card-height: 274px; --custom-guild-directory-landing-min-header-height: 200px; --custom-guild-shop-page-two-column-max-width: 1439px; --custom-aspect-stable-image-container-padding: 20px; --custom-monetization-info-table-expandable-rows-toggle-expand-column-width: 30px; --custom-guild-shop-content-width: 1044px; --custom-guild-shop-content-width-reduced: 788px; --custom-guild-shop-content-width-minimum: 688px; --custom-guild-shop-channel-row-gradient: linear-gradient(113deg, #2f3570 1.98%, #422c70 94.48%); --custom-guild-shop-channel-row-gradient-hover: linear-gradient(113deg, #383f86 1.98%, #4d3385 94.48%); --custom-guild-shop-channel-row-border-gradient: linear-gradient(113deg, #6591ff, #d150ff); --custom-guild-shop-channel-row-glow: 0 0 4px rgba(189, 149, 255, 0.5); --custom-guild-shop-preview-pill-shadow-dark: -4px 5px #1d1d1d; --custom-guild-shop-preview-pill-shadow-light: -4px 5px #d7dce8; --custom-guild-shop-gradient-start: #686bff; --custom-guild-shop-gradient-end: #c356fd; --custom-guild-role-connections-modal-close-button-margin: 12px; --custom-clips-enabled-indicator-medium-break-point: 920px; --custom-clips-enabled-indicator-badge-icon-dimension-override: 20px; --custom-client-themes-editor-content-width: calc(var(--custom-theme-selection-selection-size) * 3 + var(--custom-theme-selection-group-column-gap) * 2); --custom-client-themes-editor-editor-padding: 16px; --custom-theme-selection-selection-size: 60px; --custom-theme-selection-group-column-gap: 24px; --custom-channel-attachment-upload-spoiler-blur-radius: 44px; --custom-channel-attachment-upload-mini-attachment-size: 78px; --custom-channel-textarea-text-area-height: 44px; --custom-channel-textarea-text-area-max-height: 50vh; --custom-channel-textarea-app-launcher-button-gap: 8px; --custom-channel-notice-icon-size: 16px; --custom-channel-notice-padding: 12px; --custom-channel-call-participants-popout-padding-value: 16px; --custom-stream-upsell-modal-art-height: 149px; --custom-voice-channel-status-modal-emoji-size: 22px; --custom-voice-channel-status-modal-emoji-margin: 10px; --custom-broadcasting-tooltip-image-offset: 40px; --custom-application-directory-content-min-width: 600px; --custom-application-directory-content-max-width: 1024px; --custom-guild-count-small-icon-size: 16px; --custom-guild-count-large-icon-size: 20px; --custom-collection-gallery-text-container-width: 400px; --custom-collection-gallery-media-breakpoint: 1024px; --custom-collection-gallery-column-card-height: 600px; --custom-collection-gallery-row-card-height: 283px; --custom-collection-list-card-gap: 16px; --custom-collection-list-with-image-grid-gap: 16px; --custom-collections-collection-gap: 32px; --custom-application-directory-profile-sidebar-width: 192px; --custom-application-directory-profile-sidebar-margin-right: 48px; --custom-application-directory-profile-icon-size: 122px; --custom-application-directory-search-sidebar-width: 200px; --custom-application-directory-search-sidebar-margin-right: 32px; --custom-activity-bookmark-embed-image-width: 356px; --custom-activity-bookmark-embed-image-height: 200px; --custom-activity-bookmark-embed-content-height: 400px; --custom-activity-shelf-item-activity-item-height: 230px; --custom-activity-shelf-item-large-activity-item-height: 143px; --custom-activity-shelf-modal-modal-padding: 80px; --custom-activity-shelf-modal-modal-width: 496px; --custom-activity-shelf-modal-modal-min-width: 496px; --custom-activity-shelf-modal-modal-max-width: 1024px; --custom-activity-shelf-modal-modal-header-height: 92px; --custom-activity-shelf-modal-modal-header-without-description-height: 74px; --custom-activity-shelf-modal-modal-footer-height: 50px; --custom-activity-shelf-modal-modal-art-height: 64px; --custom-activity-shelf-modal-modal-max-height: 720px; --custom-activity-shelf-modal-modal-header-developer-controls-height: 176px; --custom-activity-shelf-modal-dividers-height: 2px; --custom-activity-shelf-modal-divider-height: 1px; --custom-activity-shelf-slide-activity-directory-shelf-grid-gap: 16px; --custom-accept-invite-modal-invite-modal-height: 420px; --custom-accept-invite-modal-small-screen-width: 720px; --custom-avatar-avatar-decoration-border-position: calc((0.5 - var(--decoration-to-avatar-ratio) / 2) * 100%); --custom-button-button-xl-width: 148px; --custom-button-button-xl-height: 50px; --custom-button-button-lg-width: 130px; --custom-button-button-lg-height: 44px; --custom-button-button-md-width: 96px; --custom-button-button-md-height: 38px; --custom-button-button-sm-width: 60px; --custom-button-button-sm-height: 32px; --custom-button-button-tn-height: 24px; --custom-button-button-tn-width: 52px; --custom-button-link-underline-width: 1px; --custom-button-link-underline-offset: 1px; --custom-button-link-underline-stop: calc(var(--custom-button-link-underline-width) + var(--custom-button-link-underline-offset)); --custom-button-filled-hover: 0.1; --custom-button-filled-active: 0.2; --custom-button-transition-duration: 170ms; --custom-modal-min-width-large: 800px; --custom-special-markdown-small-break-point: 600px; --custom-special-markdown-medium-break-point: 768px; --custom-user-profile-hype-squad-badge-icon-size: 24px; --custom-user-profile-hype-squad-badge-shine-size-offset: 64px; --custom-guild-discovery-gutter-size: 16px; --custom-guild-discovery-max-page-width: 1608px; --custom-dropdown-button-small-dropdown-size: 16px; --custom-dropdown-button-medium-dropdown-size: 24px; --custom-dropdown-button-large-dropdown-size: 32px; --custom-dropdown-button-separator-padding: 4px; --custom-dropdown-button-hitbox-padding: 8px; --custom-responsive-embed-tile-loading-background-width: 271px; --custom-game-install-locations-item-padding: 20px; --custom-game-list-row-min-height: 62px; --custom-game-list-linked-to-glow-duration: 2000ms; --custom-application-store-home-store-home-width: 1245px; --custom-application-store-listing-body-max-width: 880px; --custom-store-colors-primary-750: #191b1d; --custom-store-colors-premium-gradient: linear-gradient(90deg, var(--premium-tier-2-purple), var(--premium-tier-2-pink)); --custom-member-list-item-avatar-decoration-padding: 2px; --custom-messages-popout-messages-popout-footer-height: 120px; --custom-radio-image-border-thickness: 2px; --custom-standard-sidebar-view-sidebar-content-width: 192px; --custom-standard-sidebar-view-standard-padding: 20px; --custom-standard-sidebar-view-sidebar-content-scrollbar-padding: 6px; --custom-standard-sidebar-view-sidebar-total-width: calc(var(--custom-standard-sidebar-view-sidebar-content-width) + var(--custom-standard-sidebar-view-standard-padding) + var(--custom-standard-sidebar-view-sidebar-content-scrollbar-padding)); } :root.theme-dark { --secondary: hsl(203 calc(var(--saturation-factor)*91%) 48% /1) !important; --tertiary: hsl(202 calc(var(--saturation-factor)*84%) 50% /1) !important; --quaternary: hsl(202 calc(var(--saturation-factor)*85%) 52% /1) !important; --quinary: hsl(200 calc(var(--saturation-factor)*89%) 58% /1) !important; --control-quinary-foreground: color-mix(in oklab, hsl(200 calc(var(--saturation-factor)*89%) 58% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)) !important; --senary: hsl(201 calc(var(--saturation-factor)*85%) 58% /1) !important; --text-senary: color-mix(in oklab, hsl(201 calc(var(--saturation-factor)*85%) 58% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)) !important; --septenary: hsl(198 calc(var(--saturation-factor)*93%) 62% /1) !important; --octonary: hsl(195 calc(var(--saturation-factor)*97%) 66% /1) !important; --nonary: hsl(194 calc(var(--saturation-factor)*100%) 69% /1) !important; --denary: hsl(191 calc(var(--saturation-factor)*100%) 70% /1) !important; --undenary: hsl(188 calc(var(--saturation-factor)*100%) 72% /1) !important; --duodenary: hsl(184 calc(var(--saturation-factor)*100%) 74% /1) !important; --tredenary: hsl(180 calc(var(--saturation-factor)*100%) 75% /1) !important; --quattuordenary: hsl(180 calc(var(--saturation-factor)*100%) 77% /1) !important; --mentionedmessages: color-mix(in oklab, hsl(209 calc(var(--saturation-factor)*100%) 45% /0.05) 100%, hsl(var(--custom-theme-base-color-hsl, 0 0% 0%)/0.05) var(--custom-theme-base-color-amount, 0%)) !important; --mentionedmessageshover: color-mix(in oklab, hsl(209 calc(var(--saturation-factor)*100%) 45% /0.1) 100%, hsl(var(--custom-theme-base-color-hsl, 0 0% 0%)/0.1) var(--custom-theme-base-color-amount, 0%)) !important; --mentionedmessagesbefore: color-mix(in oklab, hsl(209 calc(var(--saturation-factor)*100%) 45% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)) !important; --highlight-messages: hsl(209 calc(var(--saturation-factor)*100%) 45% /0.3) !important; --mentioned-messages: hsl(209 calc(var(--saturation-factor)*100%) 45% /0.15) !important; --buttons-active-primaryGradient1: hsl(196 calc(var(--saturation-factor)*100%) 50% /1) !important; --buttons-active-primaryGradient2: hsl(164 calc(var(--saturation-factor)*100%) 50% /1) !important; } :root.theme-darker { --secondary: hsl(204 calc(var(--saturation-factor)*89%) 48% /1) !important; --tertiary: hsl(201 calc(var(--saturation-factor)*80%) 51% /1) !important; --quaternary: hsl(202 calc(var(--saturation-factor)*85%) 52% /1) !important; --quinary: hsl(204 calc(var(--saturation-factor)*91%) 59% /1) !important; --control-quinary-foreground: color-mix(in oklab, hsl(204 calc(var(--saturation-factor)*91%) 59% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)) !important; --senary: hsl(203 calc(var(--saturation-factor)*79%) 57% /1) !important; --text-senary: color-mix(in oklab, hsl(203 calc(var(--saturation-factor)*79%) 57% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)); --septenary: hsl(198 calc(var(--saturation-factor)*86%) 62% /1) !important; --octonary: hsl(195 calc(var(--saturation-factor)*91%) 65% /1) !important; --nonary: hsl(195 calc(var(--saturation-factor)*94%) 69% /1) !important; --denary: hsl(190 calc(var(--saturation-factor)*96%) 70% /1) !important; --undenary: hsl(186 calc(var(--saturation-factor)*100%) 72% /1) !important; --duodenary: hsl(179 calc(var(--saturation-factor)*100%) 74% /1) !important; --tredenary: hsl(172 calc(var(--saturation-factor)*100%) 79% /1) !important; --quattuordenary: hsl(170 calc(var(--saturation-factor)*100%) 83% /1) !important; --mentionedmessages: color-mix(in oklab, hsl(215 calc(var(--saturation-factor)*100%) 43% /0.05) 100%, hsl(var(--custom-theme-base-color-hsl, 0 0% 0%)/0.05) var(--custom-theme-base-color-amount, 0%)) !important; --mentionedmessageshover: color-mix(in oklab, hsl(215 calc(var(--saturation-factor)*100%) 43% /0.1) 100%, hsl(var(--custom-theme-base-color-hsl, 0 0% 0%)/0.1) var(--custom-theme-base-color-amount, 0%)) !important; --mentionedmessagesbefore: color-mix(in oklab, hsl(215 calc(var(--saturation-factor)*100%) 43% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)) !important; --highlight-messages: hsl(215 calc(var(--saturation-factor)*100%) 43% /0.3) !important; --mentioned-messages: hsl(215 calc(var(--saturation-factor)*100%) 43% /0.15) !important; --buttons-active-primaryGradient1: hsl(197 calc(var(--saturation-factor)*100%) 50% /1) !important; --buttons-active-primaryGradient2: hsl(163 calc(var(--saturation-factor)*100%) 50% /1) !important; } :root.theme-midnight { --secondary: hsl(205 calc(var(--saturation-factor)*91%) 48% /1) !important; --tertiary: hsl(203 calc(var(--saturation-factor)*82%) 50% /1) !important; --quaternary: hsl(202 calc(var(--saturation-factor)*85%) 52% /1) !important; --quinary: hsl(207 calc(var(--saturation-factor)*92%) 59% /1) !important; --control-quinary-foreground: color-mix(in oklab, hsl(207 calc(var(--saturation-factor)*92%) 59% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)) !important; --senary: hsl(210 calc(var(--saturation-factor)*83%) 57% /1) !important; --text-senary: color-mix(in oklab, hsl(210 calc(var(--saturation-factor)*83%) 57% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)) !important; --septenary: hsl(207 calc(var(--saturation-factor)*99%) 62% /1) !important; --octonary: hsl(207 calc(var(--saturation-factor)*100%) 74% /1) !important; --nonary: hsl(210 calc(var(--saturation-factor)*100%) 79% /1) !important; --denary: hsl(207 calc(var(--saturation-factor)*100%) 66% /1) !important; --undenary: hsl(202 calc(var(--saturation-factor)*100%) 67% /1) !important; --duodenary: hsl(190 calc(var(--saturation-factor)*100%) 67% /1) !important; --tredenary: hsl(182 calc(var(--saturation-factor)*100%) 69% /1) !important; --quattuordenary: hsl(182 calc(var(--saturation-factor)*100%) 73% /1) !important; --mentionedmessages: color-mix(in oklab, hsl(221 calc(var(--saturation-factor)*100%) 42% /0.05) 100%, hsl(var(--custom-theme-base-color-hsl, 0 0% 0%)/0.05) var(--custom-theme-base-color-amount, 0%)) !important; --mentionedmessageshover: color-mix(in oklab, hsl(221 calc(var(--saturation-factor)*100%) 42% /0.1) 100%, hsl(var(--custom-theme-base-color-hsl, 0 0% 0%)/0.1) var(--custom-theme-base-color-amount, 0%)) !important; --mentionedmessagesbefore: color-mix(in oklab, hsl(221 calc(var(--saturation-factor)*100%) 42% /1) 100%, var(--custom-theme-text-color, #000) var(--custom-theme-text-color-amount, 0%)) !important; --highlight-messages: hsl(221 calc(var(--saturation-factor)*100%) 42% /0.3) !important; --mentioned-messages: hsl(221 calc(var(--saturation-factor)*100%) 42% /0.15) !important; --buttons-active-primaryGradient1: hsl(198 calc(var(--saturation-factor)*100%) 50% /1) !important; --buttons-active-primaryGradient2: hsl(162 calc(var(--saturation-factor)*100%) 50% /1) !important; } html.platform-web { .base__5e434 { grid-template-areas: "titleBar titleBar titleBar" "notice notice notice" "guildsList channelsList page"; grid-template-rows: [top] 0px [titlebarEnd] min-content [page] 0px [end] !important; } .bar_c38106 { height: 0; } .bar_c38106 .title_c38106 { display: none; } .bar_c38106 .trailing_c38106 { top: 30px !important; } .scroller_ef3116 { padding-top: 12px !important; } .notice__6e2b9, #bd-notices { margin-top: 0px !important; } .base__5e434:has(.notice__6e2b9, .bd-notice) .bar_c38106 .trailing_c38106 { top: 69px !important; } } html.platform-osx .base__5e434 { grid-template-areas: "titleBar titleBar titleBar" "notice notice notice" "guildsList channelsList page"; grid-template-rows: [top] 0px [titlebarEnd] min-content [page] 0px [end] !important; .sidebar__5e434>.guilds__5e434 { margin-top: 32px; } .title_c38106, .leading_c38106 { pointer-events: none; } .bar_c38106 .trailing_c38106 { top: 32px; } .notice__6e2b9, #bd-notices { margin-top: 0; margin-bottom: -38px; } &:has(.notice__6e2b9, .bd-notice) .trailing_c38106 { top: 70px !important; } &:has(.notice__6e2b9, .bd-notice) :is(.sidebarList__5e434, .page__5e434) { margin-top: 38px !important; } } html.platform-osx .systemBar_c38106 { background: none; } html.platform-osx .title_c38106 { display: none !important; } :is(html.platform-linux, html.platform-win) .trailing_c38106 { margin-top: 6px !important; } #app-mount .h5_b717a1.eyebrow_b717a1 { text-transform: uppercase !important; } html.theme-dark .hljs-addition { background-color: #033a16; color: #aff5b4; } html.theme-dark .hljs-deletion { background-color: #67060c; color: #ffdcd7; } html.theme-dark :is(.hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-id, .hljs-variable) { color: #79c0ff; } html.theme-light :is(.hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-id, .hljs-variable) { color: #005cc5; } html.theme-dark :is(.hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__, .hljs-title.function_) { color: #d2a8ff; } html.theme-light :is(.hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__, .hljs-title.function_) { color: #6f42c1; } html.theme-dark :is(.hljs-code, .hljs-comment, .hljs-formula) { color: #8b949e; } html.theme-light :is(.hljs-code, .hljs-comment, .hljs-formula) { color: #6a737d; } html.theme-dark :is(.hljs-built_in, .hljs-symbol) { color: #ffa657; } html.theme-light :is(.hljs-built_in, .hljs-symbol) { color: #e36209; } html.theme-dark :is(.hljs-name, .hljs-quote, .hljs-selector-pseudo, .hljs-selector-tag) { color: #7ee787; } html.theme-light :is(.hljs-name, .hljs-quote, .hljs-selector-pseudo, .hljs-selector-tag) { color: #22863a; } html.theme-dark :is(.hljs-meta .hljs-string, .hljs-regexp, .hljs-string) { color: #a5d6ff; } html.theme-light :is(.hljs-meta .hljs-string, .hljs-regexp, .hljs-string) { color: #032f62; } .sidebarListRounded__5e434 { border-top-left-radius: unset; } .sidebar__5e434:after { display: none; } .panels__5e434 { max-width: calc(var(--custom-guild-sidebar-width) - var(--custom-guild-list-width)); min-width: 240px; display: flex; width: 100%; flex-direction: column; border: none; border-radius: 0; } .wrapper_f563df { gap: unset; padding: 4px 0 6px 2px; .button_f563df { border-radius: 50%; width: 32px; height: 32px; padding: 4px; } } html:not(.density-cozy, .density-compact) .item_c1e9c4 { margin: 2px 0; } .sidebar__23e6b:not(.selected_aa8da2, :hover) { color: var(--interactive-text-default); } .label_c1e9c4 { color: var(--interactive-text-default); } .colorDefault_c1e9c4 { color: var(--text-strong); } .iconContainer_c1e9c4 { width: 18px; height: 18px; } .separator_c1e9c4 { margin: 4px; } .iconContainer_c1e9c4 { svg.radioIcon_c1e9c4 { width: 16px; height: 16px; margin-top: 2px; } .refreshIconFill__001a7 { fill: transparent; stroke: white; stroke-width: 2; r: 10; } .refreshIconStroke__001a7 { stroke-width: 0; } .refreshIcon__001a7 { fill: var(--blurple); r: 6; } } .icon__9293f, .iconWrapper__2cbe2 svg { height: 24px; width: 24px; padding: unset; } .caret_c1e9c4 { width: 16px; height: 16px; } .buttons__37e49 { gap: 2px; .buttonChevron__37e49 { margin: 0; } &:has(> :nth-child(6)) .buttonChevron__37e49 { display: none; } } .wrapper_cc5dd2, .childWrapper__6e9f8, .icon__6e9f8 { width: 48px !important; height: 48px !important; } .wrapper_cc5dd2>.svg_cc5dd2 { inset: auto; contain: none; } .wrapper_cc5dd2>.svg_cc5dd2 foreignObject { mask: none; overflow: visible; x: -4; y: -4; } .wrapper_cc5dd2>.svg_cc5dd2 foreignObject[width="48"] { x: 0; y: 0; } .wrapper_cc5dd2 .wrapper__6e9f8 { width: 48px; height: 48px; transition: border-radius 0.2s ease; } .header_f37cb1 { padding: unset; } .bannerVisible_f37cb1 .header_f37cb1 { border-bottom-color: transparent; } .headerGlass_f37cb1 { display: none; } .headerContent_f37cb1 { gap: unset; justify-content: unset; height: 100%; span { display: none; } .guildDropdown_f37cb1 { gap: unset; width: 100%; padding: var(--space-xs) var(--space-md); border-radius: 0; } } .lookLink__201d5.colorPrimary__201d5 { color: var(--text-default); } .drawerSizingWrapper__08434 { right: 0px !important; } .contentWrapper__08434 { border-radius: 8px; box-shadow: var(--shadow-border), var(--shadow-high); border: unset; } .header_fed6d3, .soundboardHeader__08434 { box-shadow: var(--shadow-ledge); border-bottom: unset; } .emojiPicker_c0e32c { box-shadow: var(--shadow-border), var(--shadow-high); border-bottom-right-radius: var(--custom-emoji-picker-border-radius); border-bottom-left-radius: var(--custom-emoji-picker-border-radius); grid-template-columns: 48px auto; grid-template-rows: auto 1fr auto; height: var(--custom-emoji-picker-constants-emoji-picker-height); width: var(--custom-emoji-picker-constants-min-emoji-picker-width); .headerLabel__14245 { text-transform: uppercase; font-size: 12px; margin-right: 8px; margin-top: 3px; } } .emojiPickerHasTabWrapper_c0e32c .emojiPicker_c0e32c { background-color: transparent; border-bottom-right-radius: 0; border-bottom-left-radius: 0; box-shadow: none; flex: 1 1 auto; grid-template-rows: auto 1fr auto; height: 100%; width: auto; } .categoryList_c0e32c { top: 58px; } .expressionPickerCategoryList_a1e0e0 { top: 50px; } .inspector_aeaaeb { border-top: unset; } .emojiPickerHasTabWrapper_c0e32c .categoryList_c0e32c { top: 50px; } .unicodeShortcut_b9ee0c { box-sizing: unset; border-top: unset; } .wrapper__14245 { background-color: transparent; } .header_c0e32c { box-shadow: var(--shadow-low); margin: 0 -1px; padding: 12px; border-bottom: unset; .sizeMedium__201d5 { display: none; } } .header_d5f3cd { text-transform: uppercase; font-size: 12px; } .infoIcon_ae2544 { margin-bottom: -3px; margin-left: 5px; } .clickable__9293f .icon__9293f { color: var(--interactive-text-default); } .messagesPopoutWrap_e8b59c { border-radius: 8px; max-height: 91vh !important; } .root__49fc1 { border: none; outline: none; } .rootWithShadow__49fc1 { box-shadow: var(--legacy-elevation-border), var(--legacy-elevation-high); } .channelName__754bd div, .channelName__754bd input { font-weight: 600; } .input__4f074 { border-radius: 5px; } .outer__4f074:hover .input__4f074 { background-color: unset; outline: unset; } .input__4f074:focus, .outer__4f074:hover .input__4f074:focus { background-color: var(--input-background); outline: none; } .tab_f8303a { display: flex; flex-shrink: 1; align-items: center; gap: var(--spacing-8); padding-bottom: var(--spacing-12); } .brand_aa8da2.item_aa8da2:hover, .themed_aa8da2.item_aa8da2:hover { color: var(--interactive-text-hover); } .recentMentionsPopout__95796 .top_aa8da2 .item_aa8da2 { margin-bottom: unset; } .recentMentionsPopout__95796 .top_aa8da2 .item_aa8da2.selected_aa8da2 { cursor: default; } .recentMentionsPopout__95796 .top_aa8da2 .item_aa8da2.selected_aa8da2:after, .recentMentionsPopout__95796 .top_aa8da2 .item_aa8da2:hover:after { border-top-left-radius: unset; border-top-right-radius: unset; margin-top: -3px; } .titleWrapper__9293f>.defaultColor__5345c.text-md\\/medium_cf4812 { text-transform: unset !important; } .topic__6ec1a { color: var(--header-secondary); } .root_bfe55a { background: unset; } .button__201d5:is(.bannerColor_fb7f94) { border: unset; } .tab_ab6641:is(.item_aa8da2) { font-size: 16px !important; line-height: 20px !important; cursor: pointer; font-weight: 500 !important; transition: none !important; } .topPill_aa8da2 .item_aa8da2 { margin: 0 8px; padding: 2px 8px; min-height: unset; } .searchBar_e6b769 .button_a22cb0.secondary_a22cb0 { width: 100%; height: 28px; min-height: 28px; overflow: hidden; border-radius: 5px; background: var(--backgroundDark-45) !important; background-image: none !important; border: none !important; box-shadow: none; padding: 0 4px; &:hover:not(:disabled) { background: var(--backgroundDark-45) !important; border: none !important; background-image: none !important; } &:active:not(:disabled) { background: var(--backgroundDark-45) !important; border: none !important; background-image: none !important; } .buttonChildrenWrapper_a22cb0 { justify-content: start; margin-left: -20px; color: var(--text-muted); } } .wrapper_f7ecac:not(.popover_c97e55) { box-shadow: var(--elevation-stroke); } .toolbar__9293f { gap: unset; padding-left: unset; } .iconBadgeBottom__9293f { right: 2px; bottom: 0; --custom-icon-offset: unset; } .navButton__08434 { border-radius: 4px; color: var(--interactive-text-default); font-size: 16px; font-weight: 600; line-height: 20px; padding: 2px 8px; transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out; } .navButtonActive__08434 { color: var(--interactive-text-active); } .navButton__08434:hover { color: var(--interactive-text-hover); } button.button__67645, .visual-refresh span.button__67645 { transition: none; } .micButtonParent__37e49:hover>button { background-color: rgba(0, 0, 0, 0); } .medium_a45028 { height: unset; .inner_a45028 { padding: 1px; .input_a45028 { padding: 0 8px; line-height: 32px; margin: 1px; } .iconLayout_a45028 { width: 32px; height: 32px; } } } .container_a45028 { border: none; } .search__49676 { margin: 0 8px; } .searchBar_c322aa { padding: 0 2px; height: 24px; width: 130px; border: none; .DraftEditor-root { padding: 2px 0; line-height: 16px; } svg path { fill: var(--text-muted); } } .search_c322aa:is(.open_c322aa) .searchBar_c322aa { width: 264px; } .container__16eb0, .itemContainer__971b5, .container_fea832 { border-radius: 5px; border: none; } .lookFilled__3f413.select__3f413 { padding: 8px 8px 8px 12px; } .root__49fc1, .container_e45859, .container__60fa3, .searchBar__5ec2f, .link__2ea32, .container_a45028, .container__91a9d, .option__16eb0, .wrapper_d5f3cd, .guildInviteContainer__083ae, .section__00943, .container__0be77, .popout_af3b89, .content__07f91 { border-radius: 5px; } .button__7d7f7 { border-radius: 999% !important; [data-text-variant="text-xs/normal"] { display: none; } } .select__3f413 { border: 1px solid transparent; cursor: pointer; box-sizing: border-box; grid-gap: 8px; border-radius: 4px; min-height: unset; } .container_f89b2c { background-color: var(--opacity-black-8); border-color: var(--opacity-black-28); min-height: unset; border-radius: 5px; } .member__5d473 { max-width: 224px; } .barButtonAlt__0f481 { background: none; &:hover { background: none; } } .custom-theme-background .container_a99829 { border: unset; } .inlineContainer__74017 { box-shadow: inherit; background: unset; border-color: transparent; } .inner_a99829 { border-radius: 5px; } .buttons__74017 { margin-right: -6px !important; } .button__74017 { padding: 4px; margin-left: 4px; margin-right: 4px; } .base__5e434 .bar_c38106:has(.clickable__81391)+.content__5e434:not(:has(.chatLayerWrapper__01ae2)) .toolbar__9293f:not(.toolbar__49508) { gap: 0; margin-left: 10px; margin-right: calc(40px * var(--trailingCounter)); padding: 0; } .base__5e434 { grid-template-areas: "titleBar titleBar titleBar" "notice notice notice" "guildsList channelsList page"; grid-template-rows: [top] 0px [titlebarEnd] min-content [page] 22px [end]; --trailingCounter: 1; &:has(.trailing_c38106 > :nth-child(2 of :not(span, .winButtons_c38106))) { --trailingCounter: 2; } &:has(.trailing_c38106 > :nth-child(3 of :not(span, .winButtons_c38106))) { --trailingCounter: 3; } &:has(.trailing_c38106 > :nth-child(4 of :not(span, .winButtons_c38106))) { --trailingCounter: 4; } &:has(.trailing_c38106 > :nth-child(5 of :not(span, .winButtons_c38106))) { --trailingCounter: 5; } &:has(.trailing_c38106 > :nth-child(6 of :not(span, .winButtons_c38106))) { --trailingCounter: 6; } } .base__5e434 .sidebar__5e434 { display: grid; grid-template-areas: "guilds sidebar" "guilds panels"; grid-template-columns: [start] min-content [sidebarStart] unset [end]; grid-template-rows: [start] 1fr [panelsStart] min-content [end]; border-radius: 0; } .base__5e434 .sidebar__5e434>.guilds__5e434 { grid-area: guilds; margin-bottom: -13.5px; border-right: 1px solid var(--backgroundDark-25); } .base__5e434 .sidebar__5e434>.sidebarList__5e434 { grid-area: sidebar; min-width: 240px; max-width: none; --custom-app-panels-height: 0; } .panels__5e434 { max-width: calc(264px - var(--custom-guild-list-width)); } .base__5e434.vc-betterFolders-sidebar-grid { grid-template-columns: [start] 100px [guilds-end] min-content [betterFoldersSidebar-end] auto [channelsEnd] 1fr [end]; grid-template-areas: "titleBar titleBar titleBar titleBar" "guildsList betterFoldersSidebar notice notice" "guildsList betterFoldersSidebar channelsList page"; } .base__5e434.vc-betterFolders-sidebar-grid .sidebar__5e434 { grid-template-columns: [start] 70px [guilds-end] min-content [betterFoldersSidebar-end] 240px [end]; grid-template-areas: "guilds betterFoldersSidebar sidebar" "guilds betterFoldersSidebar panels"; width: auto !important; } .folderContentIsOpen_ac0584 .base__5e434 { grid-template-areas: "titleBar titleBar titleBar titleBar" "notice notice notice notice" "guildsList guildsList channelsList page"; grid-template-columns: [start] min-content [guildsEnd] min-content [guildsEnd] min-content [channelsEnd] 1fr [end]; } .folderContentIsOpen_ac0584 .base__5e434 .sidebar__5e434 { grid-template-areas: "guilds guildsFolderList sidebar" "guilds guildsFolderList panels"; } .base__5e434 .sidebar__5e434>.panels__5e434 { grid-area: panels; position: static; inset: auto; .avatar__37e49.wrapper__44b0c { width: 32px !important; height: 32px !important; svg { width: 40px; height: 40px; } } } .toolbar__9293f .clickable__81391 { width: 32px; svg { transform: scale(1.3); } .badge__81391 { margin-right: -1px; margin-bottom: -1px; transform: scale(1.3); } } .toolbar__9293f>.iconWrapper__9293f { height: 24px !important; width: auto !important; margin: 0 8px; svg { width: 24px; height: 24px; svg:has([d="M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5 0 0 0-.7 0l-.03.03a3 3 0 0 0 0 4.24L13 5l-2.92 2.92-3.65-.34a2 2 0 0 0-1.6.58l-.62.63a1 1 0 0 0 0 1.42l9.58 9.58a1 1 0 0 0 1.42 0l.63-.63a2 2 0 0 0 .58-1.6l-.34-3.64L19 11l.38.38ZM9.07 17.07a.5.5 0 0 1-.08.77l-5.15 3.43a.5.5 0 0 1-.63-.06l-.42-.42a.5.5 0 0 1-.06-.63L6.16 15a.5.5 0 0 1 .77-.08l2.14 2.14Z"]) { width: 20px; height: 20px; } } .iconBadgeBottom__9293f { bottom: 1px; } } .accountPopoutButtonWrapper__37e49 { padding-left: 2px; border-radius: 5px; transition: none; &:hover { color: var(--interactive-text-hover); } } .accountPopoutButtonWrapper__37e49 .nameTag__37e49 { padding-bottom: 4px; padding-top: 4px; margin-right: 0; } .nameTag__37e49 { margin-right: 4px; } .peopleListItem_cc6179 { transition: unset !important; } .base__5e434 .text-sm\\/medium__13cf1:not(.title_b6c092, .text_c9d15c, .applicationSublabel_e1ecd3 .text-sm\\/medium__13cf1 .lineClamp1__4bd52, .searchFilter_bd8186, .searchAnswer_bd8186), .text-xs\\/bold_cf4812 { text-transform: uppercase; font-size: 12px; line-height: 16px; letter-spacing: 0.02em; font-weight: 600; } .header__16eb0, .groupHeader__971b5 [data-text-variant="text-xs/semibold"] { text-transform: uppercase; font-size: 12px; line-height: 16px; letter-spacing: 0.02em; font-weight: 500; color: var(--text-default) !important; } .eyebrow_b717a1, .container__5a838[data-layout="vertical"] .label__5a838, .defaultColor__5345c[data-text-variant="heading-xl/normal"], .defaultColor__5345c[data-text-variant="heading-md/medium"], .lineClamp2Plus__4bd52[data-text-variant="text-md/medium"], .defaultColor__5345c[data-text-variant="text-xs/medium"], .defaultColor__5345c[data-text-variant="text-xs/semibold"], .defaultColor__5345c[data-text-variant="heading-sm/semibold"], .fieldTitle_a27e58, .title__28f6b, .categoryText_e4503a, .label__5a838, .headerRow__4fbcc .text-xs\\/semibold_cf4812, .member-perms-header, legend { font-size: 12px !important; line-height: 1.3333333333333333; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.02em; color: var(--header-secondary, var(--header-primary)) !important; } .dot__9293f { width: 1px; height: 24px; margin: 0 8px; flex: 0 0 auto; background-color: var(--backgroundDark-30); } .sectionDivider_e6b769 { display: none; } .privateChannelsHeaderContainer__99e7c { display: flex; padding: 18px 8px 4px 18px !important; height: 40px !important; } .typeThread__2ea32 .name__2ea32 { font-size: 16px; } .markup__75297 code { line-height: 1.125rem; text-indent: 0; } .markup__75297>code { border: unset; color: var(--text-strong); } .markup__75297 code.inline { font-family: var(--font-code) !important; } .embedFull__623de code.inline { background: var(--primary-700) !important; } .markup__75297 blockquote { color: var(--text-default); } .childWrapper__6e9f8 svg { height: 30px !important; width: 30px !important; } .chatGradientBase__36d07 { display: none; } .formWithLoadedChatInput_f75fb0 { .channelTextArea__74017 { border: none; } .buttons__74017 { margin-right: -6px !important; gap: unset; } .button__74017 { padding: 4px; margin-left: 4px; margin-right: 4px; } .buttonContainer_e6e74f.app-launcher-entrypoint { width: 32px; height: 32px; margin-left: 4px; margin-right: 4px; --background-mod-strong: transparent; } .spriteContainer__04eed { --custom-emoji-sprite-size: 24px !important; } .lottieIcon__5eb9b { height: 24px !important; width: 24px !important; .channelAppLauncher_e6e74f & { width: 24px !important; } } .stackedBars__74017 { &:first-child, &.floatingBars__74017:empty+.stackedBars__74017:nth-child(2) { border-top-left-radius: 8px; border-top-right-radius: 8px; } &:not(:last-child) { border: none; } } .channelTextArea_f75fb0 { --custom-chat-input-margin-bottom: 24px; } .upload_aa605f { border: unset; border-radius: 4px; box-shadow: unset; .media__41ea0 { border-radius: 4px; } } .spoilerContainer__54ab5.attachmentContainer__54ab5 .media__41ea0 { border-radius: 5px; } .attachWrapper__0923f { padding: 6px 0px 6px 6px; position: relative; bottom: 0px; } .button__24af7:not(.noHover__24af7) { transition: unset; } .button__24af7:not(.noHover__24af7):hover { background-color: unset; } .buttonWrapper__24af7:hover { color: var(--interactive-text-hover); } .attachButtonInner__0923f { transition: unset; padding-left: 8px; svg { width: 22px; height: 22px; path { d: path("M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm0-17a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H7a1 1 0 1 1 0-2h4V7a1 1 0 0 1 1-1Z"); } } &:hover { background: unset; } } } .separator__49fc1 { box-shadow: 0 1px 0 0 hsl(240 calc(1 * 5.263%) 7.451% /0.3), 0 1px 2px 0 hsl(240 calc(1 * 5.263%) 7.451% /0.3); } .header__49fc1 { padding: var(--modal-vertical-padding) var(--modal-horizontal-padding); } .autocompleteAttached__6b0e0 { left: 0; right: 0; } .cooldownText_b21699 { color: #fff !important; font-size: 14px; font-weight: 400; } .jumpToPresentBar__0f481, .messagesErrorBar__0f481 { bottom: 6px; border-radius: 8px 8px 0 0 !important; } .jumpToPresentBar__0f481 { opacity: 0.95 !important; color: var(--white-500); .barButtonBase__0f481 { padding-left: unset; padding: 0 12px; } .button_a22cb0.primary_a22cb0 { flex: 0 0 auto; font-weight: 600; position: relative; background: unset !important; border: unset !important; &:hover:not(:disabled) { background: unset !important; border: unset !important; } &:active:not(:disabled) { background: unset !important; border: unset !important; } .contents__201d5:after { content: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2716%27%20height%3D%2716%27%20fill%3D%27none%27%20stroke%3D%27%23fff%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20viewBox%3D%270%200%2024%2016%27%3E%3Cpath%20d%3D%27M7%2010L12%2015%2017%2010%27%2F%3E%3C%2Fsvg%3E"); margin-left: 8px; } } } .jumpToPresentBar__0f481 .text-sm\\/medium_cf4812 { font-weight: 600; } .bottomBar__0f481 { border: unset; padding: unset; left: unset; right: unset; margin: unset; width: unset; min-width: unset; box-shadow: unset; min-height: unset; box-sizing: unset; } .barBase__0f481.bottomBar__0f481 { left: 16px; right: 16px; min-height: 24px; opacity: 0.95; border: unset; bottom: 0px !important; } .barButtonMain__0f481 { height: unset; } .embedFull__623de { border-top: unset; border-right: unset; border-bottom: unset; } .sensitivity_ac7648 { min-height: 0px; } .largeReactionBtn__23977.forceShow__23977 { padding: unset; } .reactionBtn__23977 { opacity: 0; } .reactionBtn__23977:hover { background: none; } .mainContent__29444 { margin-left: -10px; } .mainContent__29444 .icon__29444 { order: -1; } .box_f8c98c { box-shadow: var(--elevation-low); border-radius: 5px; } .hljs { display: block; overflow-x: auto; padding: 0.5em; border-radius: 4px; -webkit-text-size-adjust: none; text-size-adjust: none; color: var(--text-subtle); } .audioControls_cf09d8 { border-radius: 5px; background-color: var(--opacity-black-60); } .wrapper__260e1 { display: flex; align-items: stretch; line-height: 20px; border-radius: 10px; color: var(--channels-default); border: none; } .total__260e1 { padding: 0 6px 0 0; } .users__260e1 { padding: 0 8px 0 6px; } .total__260e1, .users__260e1 { font-feature-settings: normal; font-variant-numeric: normal; } svg.placeholderMask__87847 { width: 50px; height: 50px; } .bar__7aaec, .voiceBar__7aaec { border: unset; margin-bottom: 4px; opacity: 0.9; } .top__7aaec, .unreadTop__629e4 { top: 0; } .bottom__7aaec, .unreadBottom__629e4 { bottom: 0; } .flash__03436, .message__5126c { border-bottom-right-radius: unset; border-top-right-radius: unset; } .flash__03436[data-flash="true"], .highlighted__5126c, .replying__5126c { background-color: color-mix(in oklab, hsl(204 calc(var(--saturation-factor) * 100%) 45% /0.05) 100%, hsl(var(--custom-theme-base-color-hsl, 0 0% 0%) / 0.1607843137254902) var(--custom-theme-base-color-amount, 0%)) !important; ; } :is(.highlighted__5126c, .replying__5126c):hover { background-color: color-mix(in oklab, hsl(204 calc(var(--saturation-factor) * 100%) 45% /0.1) 100%, hsl(var(--custom-theme-base-color-hsl, 0 0% 0%) / 0.1607843137254902) var(--custom-theme-base-color-amount, 0%)) !important; } .header_dbc4b7 { background-image: url("https://discord.com/assets/7d67842f58b6d155.svg"); background-size: 200px 120px; background-position: center bottom; background-repeat: no-repeat; top: 0; left: 50%; transform: translateX(-50%); padding-top: 120px !important; margin-top: -93px; } .headerTitle_dbc4b7 .heading-xl\\/semibold_cf4812 { display: none; } .profilePreview_dbc4b7 { display: none; } .statusText__19b6d { color: var(--header-secondary); } .container_a55fdc { background: unset; box-shadow: unset; display: flex; flex-direction: column; overflow: visible; .horizontal__7c0ba>.flex__7c0ba:last-child, .horizontal__7c0ba>.flexChild__7c0ba:last-child { margin-top: -5px; } .headerDescription_a55fdc { color: var(--text-default) !important; margin-top: -1px; } } .modalSize_a55fdc { margin-top: -0.5px; width: 410px; .sizeSmall__201d5 { width: 90px; height: 36px; } .cancelButton_a55fdc { margin-right: 150px; background: var(--button-secondary); } .modalFooter_a55fdc .button__201d5:not([type="submit"], .lookLink__201d5) { display: none; } } .segmentContainer_a2de16 { margin: unset; padding: unset; } .segmentControl_a2de16 { padding: 0 16px; } .segmentControlOption_a2de16 { align-items: unset; display: unset; flex: unset; justify-content: unset; margin-left: unset; margin-right: 20px; padding-bottom: 8px; padding-top: 0; } .sourceScroller_a2de16 { height: 300px; } .sourceContainer_a2de16 { padding: 0px; } .tile_a2de16 { padding: unset; margin-top: 12px; .sourceThumbnail_a2de16 { height: 96px; width: 170px; border-radius: 4px; } } .qualitySettingsContainer_c6d3dc { border-radius: 4px; } .refreshedArt_a55fdc { content: url(https://static.discord.com/assets/3d0b430b1bae9f90.svg) !important; display: inline-block; height: var(--custom-go-live-modal-art-height); margin: -60px auto 0; width: 200px; transform: scale(1.4) translateX(-9px); } .art__29209 { background-image: url(https://discord.com/assets/4b9c3419c57d838c4076abc9d34dbea7.svg) !important; height: 120px; } .tile__90dc5 { background-color: unset; } .container__29209 { background: none; button { background: var(--background-floating); } } .wrapper_e131a9 { margin-left: unset; } .container_e131a9 { gap: 12px; margin: auto var(--space-xs); padding: var(--space-xs); padding-left: 0; padding-right: 0; .labelWrapper__06d62 .text-md\\/medium_cf4812 { font-size: 14px !important; font-weight: 600; } &:has(.voiceTimer) .connection_e131a9 { padding-bottom: 20px; } &:has(p) { gap: 28px; } } .container_e131a9:has(.largePing__06d62) { .subtext__339d0 { max-width: 190px; position: fixed; margin-left: -20px; } } .largePing__06d62 { display: block; flex: 0 0 auto; height: 18px; margin-left: 0; margin-right: 4px; width: 16px; background: unset !important; box-shadow: unset; padding: 0; align-self: start; } .rtcConnectionStatus__06d62 { height: unset; } .rtcConnectionStatusWrapper__06d62 .text-sm\\/medium_cf4812.lineClamp1__4bd52 { font-size: 12px !important; color: var(--header-secondary) !important; } .rtcConnectionStatusConnected__06d62 { color: var(--text-positive); } .wrapper_cb9592:has(.idle__2f4f7), .wrapper_cb9592:is(.video_cb9592) { z-index: 102; } .gradientBackground__11664, .gradientBackground__41626 { display: none; } .notice__6e2b9, #bd-notices { box-shadow: var(--elevation-low); margin-top: 23px; margin-bottom: -38px; grid-area: channelsList / channelsList / channelsList / page; } .base__5e434:has(.notice__6e2b9, .bd-notice) .trailing_c38106 { top: 89px; .winButtons_c38106 { bottom: 73px; } } .base__5e434:has(.notice__6e2b9, .bd-notice) :is(.sidebarList__5e434, .page__5e434) { margin-top: 37px; } .page__5e434 { height: auto; } .iconLive_c69b6d { content: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2024%2024%27%20width%3D%2724%27%20height%3D%2724%27%20%3E%3Cpath%20d%3D%27M12%203a1%201%200%200%200-1-1h-.06a1%201%200%200%200-.74.32L5.92%207H3a1%201%200%200%200-1%201v8a1%201%200%200%200%201%201h2.92l4.28%204.68a1%201%200%200%200%20.74.32H11a1%201%200%200%200%201-1V3ZM15.1%2020.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7%207%200%200%200%200-13.5A1.11%201.11%200%200%201%2014%204.2v-.03c0-.6.52-1.06%201.1-.92a9%209%200%200%201%200%2017.5Z%27%20fill%3D%27%237bbc8e%27%2F%3E%3Cpath%20d%3D%27M15.16%2016.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3%203%200%200%200%200-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1%201.16-.83a5%205%200%200%201%200%209.02Z%27%20fill%3D%27%237bbc8e%27%2F%3E%3C%2Fsvg%3E"); } .container__0be77 { border: unset; .buttonPresentation__0be77 { border: unset; } } .container_f69538 { border-radius: 5px; border: unset; } .pulseGradient__11664 { display: none; } .addFriendWumpusWrapper__72ba7 .description_ddd181 { display: none; } .container__2692d, .container_fc561d, .recentMentionsPopout__95796 { .header_e8b59c { border-bottom: unset; } .header_ab6641 { padding: 0 10px 0; } .inboxTitle_ab6641, .inboxIcon_ab6641 { display: none; } .controls_ab6641 { margin-bottom: -50px; .friendRequestsButton__523aa { color: var(--interactive-text-default); } } .top_aa8da2 .item_aa8da2.brand_aa8da2 { --selected-tab-item-color: unset; } .tabBar_ab6641 { margin-top: 10px; margin-left: 10px; .tab_ab6641 { flex: 0 0 fit-content; padding: 8px 8px; margin: 0 8px; height: 10px; margin-top: 4px; margin-bottom: 10px; border-radius: 50px; } .tab_ab6641:nth-of-type(3) { order: -2; } .tab_ab6641:nth-of-type(2) { order: -1; } } .primary__06eda { color: var(--interactive-text-default); } .secondary__06eda { color: var(--interactive-text-default); } .tertiary__06eda { color: var(--interactive-text-default); } .messages__1ccd1 { border: unset; } .messageContainer__95796 { border: unset; } } .container_d08938, .outerContainer_e1147e, .applicationStore_f07d62, .libraryHeader__5a895, .chat_f75fb0:has(.pageBody__41ed7) { z-index: 102; } .auditLog__43dab { padding: unset; border-radius: 5px; .headerClickable__43dab { padding: 10px 20px 10px 10px; } } .footerPlaceholder__98b95 { .card_dc2e44 { border-radius: 5px; } } .primaryButton__468a6, .secondaryButton__468a6 { flex: 1 1 45%; } .title__468a6, .body__468a6 { text-align: center; } .modalContent__468a6 { padding-bottom: 20px; } .form__468a6:has(.alignCenter_abf706) .separator__49fc1 { box-shadow: unset; align-self: center; } .form__468a6:has(.alignCenter_abf706) .footer__49fc1 .primaryButton__468a6.sizeMedium__201d5 { height: 50px; } .title__468a6.defaultColor__5345c.heading-lg\\/semibold_cf4812.defaultColor__4bd52 { align-self: center; } .bannerImage_f37cb1, .bannerImg_f37cb1 { width: 240px; aspect-ratio: unset; } .dialogWrapper_b1f768, .tooltipPrimary_c36707, .reactionTooltip_bbcccb, .container__50387 { border: unset; border-radius: 5px; } .tooltipPointer_c36707.tooltipPointerBg_c36707:after, .tooltipPointer_c36707.tooltipPointerBg_c36707:before { border-top: unset; } .tooltip__4e35b, .dialogWrapper_b1f768, .popout__76f04, .popout_a16aea, .container__4e30a { border-radius: 4px; } .tooltip_c36707 { border-radius: 4px; } .wrapper__44df5 { border-radius: 5px; .content__44df5 { margin-left: 8px; .title__44df5 { color: var(--header-primary); } } &:not(:has(img)) .content__44df5:before { content: url(https://discord.com/assets/dc7e9e55b3a6d39d24acdd650ecc2ef3.svg); transform: scale(0.65); } .image__44df5 { margin-left: 5px; } } .transparent__9293f .children__9293f, .transparent__9293f .toolbar__9293f, .transparent__9293f .upperContainer__9293f { opacity: 1; pointer-events: all; } .modeConnected__2ea32 .icon__2ea32, .modeConnected__2ea32:hover .icon__2ea32, .modeSelected__2ea32 .icon__2ea32, .modeSelected__2ea32:hover .icon__2ea32 { color: var(--channel-icon); } .gatedContent__7184c { .stack_dbd263[data-direction="vertical"]:before { content: url("https://discord.com/assets/a36505883459aecf5df0ae54c6d7495f.svg"); height: 250px; width: 250px; } .title__7184c { color: var(--text-strong) !important; } .description__7184c { color: var(--text-default) !important; } .primary_a22cb0 { background-color: var(--control-critical-primary-background-default); border-color: var(--control-critical-primary-border-default); color: var(--control-critical-primary-text-default); &:hover { background-color: var(--control-critical-primary-background-hover) !important; border-color: var(--control-critical-primary-border-hover) !important; color: var(--control-critical-primary-text-hover) !important; } &:active { background-color: var(--control-critical-primary-background-active) !important; border-color: var(--control-critical-primary-border-active) !important; color: var(--control-critical-primary-text-active) !important; } } } .bd-button { border-radius: 5px; } .bd-changelog-modal .bd-modal-content { padding-bottom: 20px; } .bd-file-input-wrap { border-radius: 5px; background-color: hsla(0, calc(var(--saturation-factor, 1) * 0%), 0%, 0.1); border: 1px solid hsla(0, calc(var(--saturation-factor, 1) * 0%), 0%, 0.3); } .bd-keybind-wrap.recording, .bd-keybind-wrap:not(.bd-keybind-disabled):hover { border-color: hsla(359, calc(var(--saturation-factor, 1) * 82.6%), 59.4%, 0.3); } .bd-keybind-wrap.recording { box-shadow: 0 0 6px hsla(359, calc(var(--saturation-factor, 1) * 82.6%), 59.4%, 0.3); } .bd-keybind-wrap.recording input { color: hsl(359, calc(var(--saturation-factor, 1) * 82.6%), 59.4%); } .bd-modal-inner { border-radius: 4px; } .bd-modal-root { border-radius: 4px; border: unset; } .bd-modal-header { border-radius: 4px 4px 0 0; } .bd-modal-content { border-radius: 5px 5px 0 0; padding-bottom: 20px; } .bd-number-input { display: flex; font-size: 14px; padding: 5px; margin: 0; border-radius: 5px; width: 70px; } .bd-button.bd-number-input-decrement { border-right: unset; border-radius: 3px 0 0 3px; } .bd-button.bd-number-input-increment { border-left: unset; border-radius: 0 3px 3px 0; } .bd-radio-option { padding: 10px 10px 10px 7px; margin-bottom: 8px; border-radius: 5px; .bd-radio-description { color: var(--interactive-text-default); } } .bd-toast { animation: bd-toast-up 300ms ease; transform: translateY(-10px); padding: 10px; border-radius: 5px !important; border: unset; box-shadow: var(--elevation-medium), var(--elevation-stroke); font-weight: 500; color: var(--header-primary); font-size: 14px; opacity: 1; margin-top: 10px; line-height: unset; margin-bottom: unset; pointer-events: none; user-select: none; } .bd-toast.toast-success { background-color: var(--green); color: #fff; } .bd-toast.toast-warning, .bd-toast.toast-warn { background-color: var(--yellow); color: #fff; } .bd-select { position: relative; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: space-between; background-color: var(--input-background-default); border: 1px solid var(--input-border-default); border-radius: 5px; padding: 5px 5px 5px 5px; transition: 150ms ease border-color; } .bd-store-card { padding: 12px; display: flex; flex-direction: row; align-items: center; justify-content: center; border-radius: var(--radius-sm); cursor: pointer; margin: 10px 0; border: unset; border-radius: 5px; } .bd-addon-list .bd-addon-card { display: flex; flex-direction: column; margin-bottom: 20px; border-radius: 5px; overflow: hidden; border: unset; } .bd-addon-list .bd-addon-header { padding: 16px; font-size: 14px; line-height: 20px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; overflow: hidden; } html:is([lang="en-us"]) .groupHeader__971b5[id="Filters"] [data-text-variant="text-xs/semibold"] { line-height: 0; text-indent: -9999px; display: inline-flex; &:after { content: "Search Options"; text-indent: 0; line-height: initial; display: flex; } } .bar_c38106:not(.systemBar_c38106):not(:has(.channelTabs-trailing)) { padding: 0 12px 0 !important; height: 50px; margin-top: -33px; } .bar_c38106 .title_c38106 { text-align: start; display: block; position: absolute; margin-bottom: 30px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAKCAYAAAD1oQNZAAABN2lDQ1BBZG9iZSBSR0IgKDE5OTgpAAAokZWPv0rDUBSHvxtFxaFWCOLgcCdRUGzVwYxJW4ogWKtDkq1JQ5ViEm6uf/oQjm4dXNx9AidHwUHxCXwDxamDQ4QMBYvf9J3fORzOAaNi152GUYbzWKt205Gu58vZF2aYAoBOmKV2q3UAECdxxBjf7wiA10277jTG+38yH6ZKAyNguxtlIYgK0L/SqQYxBMygn2oQD4CpTto1EE9AqZf7G1AKcv8ASsr1fBBfgNlzPR+MOcAMcl8BTB1da4Bakg7UWe9Uy6plWdLuJkEkjweZjs4zuR+HiUoT1dFRF8jvA2AxH2w3HblWtay99X/+PRHX82Vun0cIQCw9F1lBeKEuf1UYO5PrYsdwGQ7vYXpUZLs3cLcBC7dFtlqF8hY8Dn8AwMZP/fNTP8gAAAAJcEhZcwAACxMAAAsTAQCanBgAAAZWaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0OCA3OS4xNjQwMzYsIDIwMTkvMDgvMTMtMDE6MDY6NTcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMS4wIChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMTEtMTNUMTQ6MTE6NTErMDI6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjAtMTEtMTNUMTQ6MTE6NTErMDI6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTExLTEzVDE0OjExOjUxKzAyOjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmRkZjYxOTQwLWZkNzUtNzg0Mi04ZjFmLWM5MTM2YWMyNzEyOCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjQ3NzU2OTNjLTM3NDMtNjM0NS04MjRjLTVhYTc1ZWU1NzZmMCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjhhMDU1MjY1LTU4OGEtYWU0Ny1iYzNjLTE0MTViNzhmMTk2NCIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjhhMDU1MjY1LTU4OGEtYWU0Ny1iYzNjLTE0MTViNzhmMTk2NCIgc3RFdnQ6d2hlbj0iMjAyMC0xMS0xM1QxNDoxMTo1MSswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkZGY2MTk0MC1mZDc1LTc4NDItOGYxZi1jOTEzNmFjMjcxMjgiIHN0RXZ0OndoZW49IjIwMjAtMTEtMTNUMTQ6MTE6NTErMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4wIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHBob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cmRmOkJhZz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJOT0NUVVJOQUwiIHBob3Rvc2hvcDpMYXllclRleHQ9Ik5PQ1RVUk5BTCIvPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOlRleHRMYXllcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+RkxpqwAAAkxJREFUSInNlsGR2zAMRZ930oBakEtQSrBL0B50kG7eEqwS7BJWN+rAg13CuoSoBZUQlZAcBMRYmFp7Z7KZ/BmORBAkP0EAxCr08RczuqauXgBCH/fAAaCpq5XIMmAnLQdGoJN5k9HZA6XoDMCxqauzXTOFpq5Whkvb1NUxxWVhnUF4dH4OsG7qahT5zfoiPwnnsamrtV14aQ7Ak/nfhT5uUgcTo7wJoVzEufTfnM7e6BTASQ7zlSiA14V9Xj+aKLxL6eahj8Wjmz65/pJnlEIQoAW28gUoQh93CzpnZq+Y5NuaeQCXhOwz2ALPzFEAc1R4bEIfy4RcoWPTB2sk8c31i4Xby/THuO4l9PHgx72OW+cCYOZdfCh8Bk1d6XoaBfmC6iH00XNRqPHOzIYrgZdH9reeN8j3q0PsryH0cSOpRg0wOhU9U07Co8Tomqo6+WZ3PPUPrPH0ZjKu4fe/402a8u3ceG5kO67GVFgjZWY8mfs9rPEms9FDlr8HScb/CsdECsgAleXcOoU9p72E8hHuPue1sqCfqMlUy4DBEZmssuiMwF5IHLWMuINJ9i5DH/1FTgn978AP+U8etqmrMfSxxT2GErJLEaYvsOW8CX20OsO711bqtVQC11cTruWJkhlk3OuchFy+dLAEdO8C+CmtcGOWr77gMJdaS/m64zYfWq9bN3W1kppW9XzobpjPpa3wpYq+lIOTTVzLEx1T4tumriajczQELsDzoy+q6LW897KJRIHq5mi+PkjZ5HUmbsshNd6gRbThDA+E7m9Y8vo1IcgRcwAAAABJRU5ErkJggg==) no-repeat; transform: translateY(40px) translateX(12px) scale(1.01); padding-right: 32px; width: 52px; [data-text-variant="text-sm\\/medium"] { display: none; } svg { display: none; } .guildIcon_edbb22 { display: none; } html.custom-theme-background & { background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%20-2.38419e-7%2052.99%2010%27%3E%3Cpath%20d%3D%27M3.57642276%2C0.141304348%20L0%2C0.141304348%20L0%2C4.22826087%20L2.38069106%2C6.40217391%20L2.38069106%2C2.43478261%20L3.66260163%2C2.43478261%20C4.47052846%2C2.43478261%204.86910569%2C2.83695652%204.86910569%2C3.4673913%20L4.86910569%2C6.5%20C4.86910569%2C7.13043478%204.49207317%2C7.55434783%203.66260163%2C7.55434783%20L0%2C7.55434783%20L0%2C9.85869565%20L3.57642276%2C9.85869565%20C5.49390244%2C9.86956522%207.29288618%2C8.90217391%207.29288618%2C6.66304348%20L7.29288618%2C3.39130435%20C7.29288618%2C1.13043478%205.49390244%2C0.141304348%203.57642276%2C0.141304348%20Z%20M22.3310976%2C6.67391304%20L22.3310976%2C3.32608696%20C22.3310976%2C2.11956522%2024.4640244%2C1.83695652%2025.1103659%2C3.05434783%20L27.0817073%2C2.23913043%20C26.3168699%2C0.510869565%2024.8949187%2C0%2023.7207317%2C0%20C21.803252%2C0%2019.9073171%2C1.13043478%2019.9073171%2C3.32608696%20L19.9073171%2C6.67391304%20C19.9073171%2C8.88043478%2021.803252%2C10%2023.6776423%2C10%20C24.8841463%2C10%2026.3276423%2C9.39130435%2027.1247967%2C7.81521739%20L25.0134146%2C6.82608696%20C24.4963415%2C8.17391304%2022.3310976%2C7.84782609%2022.3310976%2C6.67391304%20Z%20M15.8030488%2C3.7826087%20C15.0597561%2C3.61956522%2014.5642276%2C3.34782609%2014.5319106%2C2.88043478%20C14.575%2C1.75%2016.2878049%2C1.7173913%2017.2896341%2C2.79347826%20L18.8731707%2C1.55434783%20C17.8821138%2C0.326086957%2016.7617886%2C0%2015.598374%2C0%20C13.8424797%2C0%2012.1404472%2C1%2012.1404472%2C2.91304348%20C12.1404472%2C4.77173913%2013.5408537%2C5.76086957%2015.0813008%2C6%20C15.8676829%2C6.10869565%2016.7402439%2C6.42391304%2016.7186992%2C6.97826087%20C16.654065%2C8.02173913%2014.5426829%2C7.9673913%2013.5839431%2C6.7826087%20L12.0650407%2C8.23913043%20C12.9591463%2C9.40217391%2014.1764228%2C10%2015.3182927%2C10%20C17.074187%2C10%2019.0239837%2C8.9673913%2019.0993902%2C7.08695652%20C19.2071138%2C4.69565217%2017.5050813%2C4.09782609%2015.8030488%2C3.7826087%20Z%20M8.59634146%2C9.85869565%20L11.0093496%2C9.85869565%20L11.0093496%2C0.141304348%20L8.59634146%2C0.141304348%20L8.59634146%2C9.85869565%20Z%20M49.2835366%2C0.141304348%20L45.7071138%2C0.141304348%20L45.7071138%2C4.22826087%20L48.0878049%2C6.40217391%20L48.0878049%2C2.43478261%20L49.3589431%2C2.43478261%20C50.1668699%2C2.43478261%2050.5654472%2C2.83695652%2050.5654472%2C3.4673913%20L50.5654472%2C6.5%20C50.5654472%2C7.13043478%2050.1884146%2C7.55434783%2049.3589431%2C7.55434783%20L45.6963415%2C7.55434783%20L45.6963415%2C9.85869565%20L49.2727642%2C9.85869565%20C51.1902439%2C9.86956522%2052.9892276%2C8.90217391%2052.9892276%2C6.66304348%20L52.9892276%2C3.39130435%20C53%2C1.13043478%2051.2010163%2C0.141304348%2049.2835366%2C0.141304348%20Z%20M31.7353659%2C0%20C29.753252%2C0%2027.7819106%2C1.09782609%2027.7819106%2C3.33695652%20L27.7819106%2C6.66304348%20C27.7819106%2C8.89130435%2029.7640244%2C10%2031.7569106%2C10%20C33.7390244%2C10%2035.7103659%2C8.89130435%2035.7103659%2C6.66304348%20L35.7103659%2C3.33695652%20C35.7103659%2C1.10869565%2033.7174797%2C0%2031.7353659%2C0%20Z%20M33.2865854%2C6.66304348%20C33.2865854%2C7.35869565%2032.5109756%2C7.7173913%2031.7461382%2C7.7173913%20C30.9705285%2C7.7173913%2030.1949187%2C7.36956522%2030.1949187%2C6.66304348%20L30.1949187%2C3.33695652%20C30.1949187%2C2.61956522%2030.9489837%2C2.23913043%2031.7030488%2C2.23913043%20C32.4894309%2C2.23913043%2033.2865854%2C2.58695652%2033.2865854%2C3.33695652%20L33.2865854%2C6.66304348%20Z%20M44.3605691%2C3.33695652%20C44.3067073%2C1.05434783%2042.7770325%2C0.141304348%2040.8056911%2C0.141304348%20L36.9815041%2C0.141304348%20L36.9815041%2C9.86956522%20L39.4268293%2C9.86956522%20L39.4268293%2C6.77173913%20L39.8577236%2C6.77173913%20L42.0768293%2C9.85869565%20L45.0930894%2C9.85869565%20L42.4861789%2C6.52173913%20C43.6495935%2C6.15217391%2044.3605691%2C5.14130435%2044.3605691%2C3.33695652%20Z%20M40.8487805%2C4.65217391%20L39.4268293%2C4.65217391%20L39.4268293%2C2.43478261%20L40.8487805%2C2.43478261%20C42.3784553%2C2.43478261%2042.3784553%2C4.65217391%2040.8487805%2C4.65217391%20Z%27%20fill%3D%27%23ffffff80%27%2F%3E%3C%2Fsvg%3E"); } } .bar_c38106 .trailing_c38106 { top: 51px; gap: 8px; z-index: 102; } .bar_c38106 .trailing_c38106:has(> .clickable__9293f) { top: 51px; gap: 8px; z-index: 102; } .bar_c38106 .trailing_c38106 .clickable__81391 { margin: 3px; svg { height: 32px; width: 24px; } } .bar_c38106 .channelTabs-trailing .trailing_c38106 { top: 36px; right: 10px; } .channelTabs-trailing .winButtons_c38106 { position: absolute; top: -42px; right: 6px; & .winButton_c38106 { height: calc(var(--custom-app-top-bar-height) + 4px); padding-left: 10px; padding-right: 10px; } } #channelTabs-settingsMenu { position: relative; right: 20px; top: -2px; } :is(.container__01ae2, .container_fb64c9)>.container__9293f, .page__5e434 .container__01ae2 { z-index: 102; } .bar_c38106 .trailing_c38106 .iconWrapper__9293f { width: 30px; height: 30px; border-radius: 4px; } .bar_c38106 .trailing_c38106 .iconWrapper__9293f .icon__9293f { width: 24px; height: 24px; } .bar_c38106 .trailing_c38106 .iconWrapper__9293f.selected__9293f .icon__9293f { opacity: 1; } .bar_c38106 .trailing_c38106 .iconWrapper__9293f>svg>foreignObject { x: -2px; y: -2px; mask: none !important; } html .bar_c38106 { top: 0; right: 0; z-index: 102; } .inviteToolbar__133bf>.clickable__9293f.iconWrapper__9293f { flex-wrap: wrap; } .inviteToolbar__133bf .iconWrapper__9293f:after { border-left: 1px solid var(--backgroundDark-20); content: ""; margin-left: 55px; margin-top: -29px; height: calc(var(--custom-app-top-bar-height) - var(--space-12)); } .winButtons_c38106 { position: absolute; gap: unset; justify-content: center; bottom: 38px; right: -12px; z-index: 3001; -webkit-app-region: no-drag !important; .winButton_c38106 { align-items: center; width: 28px; height: 24px; } .winButtonClose_c38106 { height: 22px; } } .winButtonsWithDivider_c38106:before { border: unset; } .systemBar_c38106 { min-height: 22px; z-index: 999999 !important; .winButtons_c38106 { bottom: 42px; left: -96px; } html.platform-linux & { display: none; } } .base__5e434 .sidebar__5e434>.guilds__5e434 { width: 72px; .scroller_ef3116 { padding-top: 2px; gap: 0px !important; .isExpanded__48112 ul.stack_dbd263 { height: auto !important; } } #guild-list-unread-dms:has(.listItem__650eb) { padding-top: 8px !important; } .listItem__650eb:has(.guildSeparator__252b6) { margin: 6px 0 8px 0; } .guildSeparator__252b6 { height: 2px; } .folderIcon__48112 { margin-top: 0px; margin-left: -1px; & svg { width: 24px; height: 24px; } } } .folderGroup__48112 { --custom-folder-preview-padding: 6px; } .folderGroup__48112:not(.isExpanded__48112) .folderIcon__48112 svg { display: none; } .folderGroupBackground__48112 { left: 11px; width: 48px; bottom: 4px; border-radius: 12px; border: none; } .folderIconWrapper__48112 { width: 48px; height: 48px; overflow: hidden; border-radius: 16px; } .expandedFolderIconWrapper__48112 { margin: 0; width: 48px; height: 48px; } .folderGroup__48112:is(.isExpanded__48112) .folderPreviewWrapper__48112 { display: none; } .folderPreviewGuildIcon__48112 { border-radius: 30% !important; } .listItem__650eb:has(.circleIcon__5bc7e) { margin: 6px 0 0 !important; .circleIconButton__5bc7e { transition: ease 0.17s; width: 48px; height: 48px; color: var(--primary) !important; } .circleIconButton__5bc7e.selected__5bc7e, .circleIconButton__5bc7e:hover:not(.disabled__5bc7e) { color: #fff !important; } } .guildsError_e8d03f { width: 48px; height: 48px; background: (rgba(240, 71, 71, 0.1)); border-color: rgba(240, 71, 71); &:hover { background: rgba(240, 71, 71); } } .mention__3b95d { box-sizing: border-box; opacity: 0.9; border: unset; box-shadow: unset; right: 1px; } .sidebar__5e434:after { display: none; } .tutorialContainer__1f388~.container__93fc9 { margin-top: 8px; margin-bottom: 4px; } .tutorialContainer__1f388~.container__93fc9 .folderGroup__48112:not(.isExpanded__48112) .folderIconWrapper__48112 { padding: 0; } .folderGroup__48112:not(.isExpanded__48112) .pendingFolderButtonIcon__93fc9 { --guildbar-avatar-size: 48px; } .stack_dbd263#guild-list-unread-dms { gap: 16px !important; padding-bottom: 10px !important; } .base__5e434[data-fullscreen="true"] { .sidebar__5e434 { display: none !important; } } .spriteContainer__04eed { --custom-emoji-sprite-size: 24px !important; } #app-mount .emojiRemove_e7d73e { opacity: 0; color: transparent; position: absolute; right: -12px; width: 24px; height: 24px; box-shadow: var(--legacy-elevation-border), var(--legacy-elevation-low); background-color: var(--background-primary); background-image: url(https://discord.com/assets/b5ad3c52d0699af9b6987839875450d4.svg); background-position: 50% 50%; background-repeat: no-repeat; border-radius: 50%; transition: opacity 0.1s ease-in-out, box-shadow 0.1s ease-in-out, transform 0.2s ease; .emojiRow_e7d73e:hover & { cursor: pointer; opacity: 1; } &:active { transform: translateY(2px); } } #app-mount .emojiRow_e7d73e:before { display: none; } .container__60fa3 { border: 1px solid var(--background-base-lowest); } .sidebar__409aa { & h1 { text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: 0.02em; line-height: 1.3333333333333333; padding: 6px 10px; margin: 0; color: var(--channels-default) !important; } } .circleIcon__5bc7e { height: 24px; width: 24px; } .sidebarResizeHandle__5e434, .outer_c0bea0.user-profile-sidebar, .clickable__9293f:has(svg path[d="M23 12.38c-.02.38-.45.58-.78.4a6.97 6.97 0 0 0-6.27-.08.54.54 0 0 1-.44 0 8.97 8.97 0 0 0-11.16 3.55c-.1.15-.1.35 0 .5.37.58.8 1.13 1.28 1.61.24.24.64.15.8-.15.19-.38.39-.73.58-1.02.14-.21.43-.1.4.15l-.19 1.96c-.02.19.07.37.23.47A8.96 8.96 0 0 0 12 21a.4.4 0 0 1 .38.27c.1.33.25.65.4.95.18.34-.02.76-.4.77L12 23a11 11 0 1 1 11-10.62ZM15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"]) { display: none !important; } .sidebar__5e434 { width: 264px !important; } .sidebarList__5e434 { --custom-guild-sidebar-width: 264px !important; border-left: none !important; } .members_c8ffbb, .membersListNotices_c8ffbb { width: 224px; } .membersWrap_c8ffbb { min-width: 224px; } .popover_f84418.popover_f84418 { border-radius: 5px !important; } .popover_f84418.popover_f84418 span:has(.hoverBarButton_f84418.hoverBarButton_f84418):not(:last-child) .hoverBarButton_f84418.hoverBarButton_f84418 { border-radius: 3px 0 0 3px !important; } .popover_f84418.popover_f84418 span:has(.hoverBarButton_f84418.hoverBarButton_f84418):not(:first-child) .hoverBarButton_f84418.hoverBarButton_f84418 { border-radius: 0 3px 3px 0 !important; } .folderButtonInner__48112, .folderIconWrapper__48112, .folderPreviewWrapper__48112 { border-radius: 12px; } .botText__82f07 { font-weight: 500; } .upperBadge_cc5dd2, .lowerBadge_cc5dd2 { margin: 36px -4px !important; } .icon__6e9f8 { border-radius: 12px; } .childWrapper__6e9f8 { overflow: hidden; } .nowPlayingColumn__133bf .header__7d20c { color: var(--text-default); text-transform: uppercase; font-size: 12px; margin-bottom: var(--space-16); font-weight: 600; } .refresh-active-now .itemCard__7e549 { border-radius: 5px; } .addFriendWumpusWrapper__72ba7 .defaultColor__4bd52 { font-size: 14px; } & .container__2692d, & .container_fc561d, & .recentMentionsPopout__95796 { & .tabBar_ab6641 { .tab_ab6641:is(.item_aa8da2:hover) { background-color: var(--backgroundDark-45); } } } & .container__2692d, & .container_fc561d, & .recentMentionsPopout__95796 { & .tabBar_ab6641 { .tab_ab6641:is(.item_aa8da2:active) { background-color: var(--backgroundDark-65); } } } & .container__2692d, & .container_fc561d, & .recentMentionsPopout__95796 { & .tabBar_ab6641 { .tab_ab6641:is(.selected_aa8da2) { background: linear-gradient(to top left, var(--primaryGradient1), var(--primaryGradient2)); ; } } } .recentMentionsPopout__95796 .top_aa8da2 .item_aa8da2.selected_aa8da2 { cursor: default; color: var(--interactive-text-active); } .jumpToPresentBar__0f481:active { margin-bottom: 0; padding-bottom: calc(var(--space-8) - 1px) !important; } .heading-lg\\/semibold_cf4812 { font-size: 16px; text-transform: uppercase; } .container_d7bc5d { border-radius: 5px; } .newMessagesBar__0f481 { padding-inline: 10px; } .visual-refresh .markup__75297 code, .after_inlineCode_ada32f, .before_inlineCode_ada32f, .before_inlineCode_ada32f { background-color: var(--backgroundDark-65); } .theme-dark .tabBar__133bf .addFriend__133bf.addFriend__133bf.addFriend__133bf[aria-selected=true] { color: var(--primary); } .responsive__19ceb .sm_a22cb0 .buttonChildrenWrapper_a22cb0 { min-height: 0; padding: 2px 16px; } .audioButtonParent__5e764 .buttonChevron__5e764 { display: none; } .container__8a031, .pillItem__9e06a, .centerButton_f1ceac, .fullRegionButton_f1ceac, .fullRegionDropdownButton_f1ceac, button.button__67645, span.button__67645, .audioButtonParent__5e764 .audioButtonWithMenu__5e764 { border-radius: 5px; border: none; } .buttonSection__1405b, .pillContainer__9e06a { border-radius: 8px; } .buttonColor_e131a9.sizeMedium__201d5:not(.sendWithMessage_ba7598, .uploadFileInputContainer__8bb30, .optionPillBtn_a16aea) { min-width: auto; } .folderIconWrapper__48112 .folderIcon__48112:hover, .keyboard-mode .folderButton__48112:focus .folderIcon__48112 { background: none; } .folderIconWrapper__48112:hover { background-color: var(--backgroundDark-35); } .clickable__4495e .mutualGuildsLink__4495e { color: #fff !important; } .listBox__2e223.scrollable__2e223 { padding-left: 0px; padding-right: 0; margin-right: -6px; } .container__50e22 { border-radius: 5px; } .popoutRoleCircle__50e22 { margin-inline-end: -2px; } .mentioned__5126c:not(.automodMessage__5126c):before { background-color: var(--primary); } .profile__9c3be, .popout_d5c2c4 { box-shadow: 0 0 5px 1.53px var(--backgroundDark-75) !important; } :where(.outer_c0bea0).user-profile-popout { box-shadow: 0 0 5px 1.53px var(--backgroundDark-75) !important; } .overflowMenuIcon_a27e58 { color: #fff; } .outer_c0bea0.user-profile-popout .heading-lg\\/bold_cf4812, .outer_c0bea0.user-profile-modal .heading-lg\\/bold_cf4812, .outer_c0bea0.user-profile-popout .heading-xl\\/bold_cf4812, .outer_c0bea0.user-profile-modal .heading-xl\\/bold_cf4812, .inner_c0bea0.user-profile-popout .heading-lg\\/bold_cf4812, .inner_c0bea0.user-profile-modal .heading-lg\\/bold_cf4812, .inner_c0bea0.user-profile-popout .heading-xl\\/bold_cf4812, .inner_c0bea0.user-profile-modal .heading-xl\\/bold_cf4812, .outer_c0bea0.user-profile-sidebar .heading-lg\\/bold_cf4812, .outer_c0bea0.user-profile-sidebar .heading-lg\\/bold_cf4812, .outer_c0bea0.user-profile-sidebar .heading-xl\\/bold_cf4812, .outer_c0bea0.user-profile-sidebar .heading-xl\\/bold_cf4812, .inner_c0bea0.user-profile-sidebar .heading-lg\\/bold_cf4812, .inner_c0bea0.user-profile-sidebar .heading-lg\\/bold_cf4812, .inner_c0bea0.user-profile-sidebar .heading-xl\\/bold_cf4812, .inner_c0bea0.user-profile-sidebar .heading-xl\\/bold_cf4812, .userPopout :is(.headerName, .headerTag), .userPopout :is(.discriminator, .userTag), .userPopout .flexHorizontal:only-child .nameDisplay, .nameSection .displayName, .nameSection .nameTag, .nameTagLegacyUsername, .nameTagLegacyDiscrim, .displayName__26b1f, .userTagDiscriminator__26b1f, .userTagUsername__26b1f, .userTagDiscriminatorNoNickname_c9ccf6, .userTagUsernameNoNickname_c9ccf6, .nickname_c9ccf6, .nameTag_afed89, .nickname__26b1f, .userTag_c9ccf6, .profileNameTag__89307, .vc-gp-name, .userTag_a27e58, .userTag__26b1f, .avatarName__9e177, .header_d5c2c4 { font-weight: 800 !important; letter-spacing: 1.2px !important; } .loadingPopout__58f1c, .loadingPopout__58f1c .spinner__46696, .profilePopout__1add6 { display: none; } .reaction__23977 .emoji, .reaction_f8896c .emoji { height: 1rem; margin: .125rem 0; min-height: auto; min-width: auto; width: 1rem; } .reactionCount__23977, .reactionCount_f8896c { min-width: 9px !important; font-size: 0.875rem; } .theme-dark .ephemeral__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover, .theme-dark .replying__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover, .theme-dark .ephemeral__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55, .theme-dark .replying__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55 { padding: .5px 5px !important; } .theme-dark .ephemeral__5126c .obscuredTextContent__299eb .wrapper_f61d60:not([style], .roleMention__75297[style]), .theme-dark .ephemeral__5126c .obscuredTextContent__299eb .interactive:not([style], .roleMention__75297[style]):hover, .theme-dark .ephemeral__5126c .obscuredTextContent__299eb .interactive:not([style], .roleMention__75297[style])[aria-expanded=true], .theme-dark .replying__5126c .obscuredTextContent__299eb .wrapper_f61d60:not([style], .roleMention__75297[style]), .theme-dark .replying__5126c .obscuredTextContent__299eb .interactive:not([style], .roleMention__75297[style]):hover, .theme-dark .replying__5126c .obscuredTextContent__299eb .interactive:not([style], .roleMention__75297[style])[aria-expanded=true], .theme-dark .replying__5126c .obscuredTextContent__299eb .interactive:not([style], .roleMention__75297[style])[aria-expanded=true] { padding: .5px 5px !important; } .theme-dark .ephemeral__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover, .theme-dark .replying__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover, .theme-dark .ephemeral__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55, .theme-dark .replying__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55 { background-color: rgba(0, 0, 0, 0) !important; color: var(--text-link) !important; padding: 0 !important; } .theme-dark .ephemeral__5126c .wrapper_f61d60:not([style], .roleMention__75297[style]), .theme-dark .ephemeral__5126c .interactive:not([style], .roleMention__75297[style]):hover, .theme-dark .ephemeral__5126c .interactive:not([style], .roleMention__75297[style])[aria-expanded=true], .theme-dark .replying__5126c .wrapper_f61d60:not([style], .roleMention__75297[style]), .theme-dark .replying__5126c .interactive:not([style], .roleMention__75297[style]):hover, .theme-dark .replying__5126c .interactive:not([style], .roleMention__75297[style])[aria-expanded=true], .theme-dark .replying__5126c .interactive:not([style], .roleMention__75297[style])[aria-expanded=true] { background-color: rgba(0, 0, 0, 0) !important; color: hsl(203, 91%, 48%) !important; padding: 0 !important; } .theme-dark .mentioned__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55, .theme-dark .mentioned__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover { background-color: rgba(0, 0, 0, 0) !important; padding: .5px 5px !important; } .theme-dark .mentioned__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55, .theme-dark .mentioned__5126c .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover { background-color: rgba(0, 0, 0, 0) !important; padding: 0 !important; } .theme-dark .mentioned__5126c .obscuredTextContent__299eb .wrapper_f61d60.roleMention__75297, .theme-dark .mentioned__5126c .obscuredTextContent__299eb .interactive { padding: .5px 5px !important; } .burstGlow__23977 { border-radius: 5px; } img[src="/assets/18e336a74a159cfd.png"] { content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/blurpleold.png") !important; } img[src="/assets/788f05731f8aa02e.png"] { content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/grayold.png"); } img[src="/assets/9855d7e3b9780976.png"] { content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/greenold.png"); } img[src="/assets/2ccd8ae8b2379360.png"] { content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/yellowold.png"); } img[src="/assets/411d8a698dd15ddf.png"] { content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/redold.png"); } img[src="/assets/320d5a40d309f942.png"] { content: url("https://khimarikmayer.github.io/Nocturnal-discord-theme/nocturnal/importCSS/Discolored/assets/pinkold.png"); } .theme-dark .mentioned__5126c .interactive:not([style], .roleMention__75297[style]):hover, .theme-dark .mentioned__5126c .interactive:not([style], .roleMention__75297[style])[aria-expanded=true] { color: var(--primary) !important; } .reaction_f8896c:not([style*="background"]):hover, .reaction__23977:not([style*="background"]):hover, .reaction_f8896c:active, .reaction__23977:not([style*="background"]):active { background-color: var(--backgroundDark-25) !important; } .secondary_a22cb0.addReactButton__34c2c { color: var(--control-secondary-text-default) !important; } .secondary_a22cb0.addReactButton__34c2c:hover:not(:disabled) { color: var(--control-secondary-text-hover) !important; } .secondary_a22cb0.addReactButton__34c2c:active:not(.color_f9d37d.banner_fb7f94, :disabled) { color: var(--control-secondary-text-active) !important; } .secondary_a22cb0.addReactButton__34c2c, .secondary_a22cb0.addReactButton__34c2c:hover:not(:disabled), .secondary_a22cb0.addReactButton__34c2c:active:not(.color_f9d37d.banner_fb7f94, :disabled) { background: rgba(0, 0, 0, 0) !important; border: none !important; font-size: 0px; padding: 0px; min-width: 1.5rem; } .theme-dark .reactionBtn__23977 { border-radius: 5px; margin-bottom: 1px; background: none !important; border: none !important; } html.visual-refresh { .reactionBtn__23977:hover { background: none; } } .reaction_f8896c.reactionMe_f8896c:not([style*="background"]) .reactionCount_f8896c, .reaction__23977.reactionMe__23977:not([style*="background"]) .reactionCount__23977 { color: var(--primary) !important; } .reaction__23977.reactionMe__23977:not([style*="background"]), .reaction_f8896c.reactionMe_f8896c:not([style*="background"]) { background-color: var(--primary-30a) !important; } .reactionInner__23977, .reaction_f8896c.reactionInner_f8896c { padding: 0 0.375rem !important; } .reaction_f8896c, .reaction__23977 { border-radius: 5px; border: none !important; margin-bottom: 0.125rem; transition: background-color 0.1s ease; } .theme-dark .mentioned__5126c .wrapper_f61d60:not([style], .roleMention__75297[style]), .theme-dark .mentioned__5126c .wrapper_f61d60:not([style], .roleMention__75297[style]):hover, .theme-dark .mentioned__5126c .interactive:not([style], .roleMention__75297[style]), .theme-dark .mentioned__5126c .interactive:not([style], .roleMention__75297[style]):hover, .theme-dark .mentioned__5126c .interactive:not([style], .roleMention__75297[style])[aria-expanded=true], .theme-dark .mentioned__5126c .wrapper_f61d60.roleMention__75297, .theme-dark .replying__5126c .wrapper_f61d60[style], .theme-dark .replying__5126c .roleMention__75297[style] { background: rgba(0, 0, 0, 0) !important; padding: 0; } .theme-dark .wrapper_f61d60:not([style], .roleMention__75297[style]) { border-radius: 50px; padding: .5px 5px; color: var(--secondary) !important; background: var(--primary-10a) !important; } .theme-dark .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55 { background-color: var(--primary-10a) !important; border-radius: 50px; padding: .5px 5px; transition: all .2s ease; } .theme-dark .wrapper_f61d60, .theme-dark .interactive { transition: all .2s ease; } .theme-dark .mention { border-radius: 50px; padding: .5px 5px; } .theme-dark .interactive:not([style], .roleMention__75297[style]):hover, .theme-dark .interactive:not([style], .roleMention__75297[style])[aria-expanded=true], .theme-dark .mentioned__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55, .theme-dark .mentioned__5126c .obscuredTextContent__299eb .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover, .theme-dark .executedCommand_c19a55 .appLauncherOnboardingCommandName_c19a55:hover { background-color: var(--primary) !important; color: #fff !important; } .theme-dark .accountProfileCard_a27e58 { background: linear-gradient(45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab); background-size: 400% 400%; animation: nocturnalGradient 15s ease infinite; } @keyframes nocturnalGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .background_a27e58 { background-image: none !important; background-color: var(--backgroundDark-30) !important; margin: 0 16px 16px !important; } .accountProfileCard_a27e58 .avatar_a27e58 { top: 16px !important; left: 16px !important; inset-inline-start: 16px !important; } .userInfo_a27e58 { padding-left: 112px !important; padding-top: 40px !important; padding-bottom: 12px !important; } .accountProfileCard_a27e58 .banner__68edb { display: none !important; } .badgeList_a27e58 { background-image: none !important; background-color: var(--backgroundDark-30) !important; }';
    }

    document.head.appendChild(style);
    this.style = style;
}

    injectIconStyles() {
        if (this.iconStyle) this.iconStyle.remove();

        if (this.settings.styleVersion !== '2023') return;

        const style = document.createElement('style');
        style.id = 'nocturnal-icon-styles';

        style.textContent = `
        .spriteGreyscale__04eed {
    background-color: var(--primary);
}
.bd-settings-group.collapsible .bd-settings-title:after {background-color: var(--primary) !important;}
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
.icon__54b20,
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
.icon__54b20 path,
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
        `;

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

        const roleDots = document.querySelectorAll('.roleDot_af3987 circle, .roleDot__48c1c circle, .dotBorderColor__4f569, .dot__4f569, .dotBorderBase__4f569, [class*="roleDot"] circle');

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

    processPathToRect() {
        if (!this.isRunning) return;

        const paths = document.querySelectorAll('.background__4f569[d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"]');

        paths.forEach(path => {
            if (path.hasAttribute('data-converted-to-rect')) return;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '20');
            rect.setAttribute('height', '20');
            rect.setAttribute('rx', '4');
            rect.setAttribute('ry', '4');
            rect.setAttribute('class', path.getAttribute('class') || '');

            rect.setAttribute('data-converted-to-rect', 'true');
            rect.setAttribute('data-original-path-d', path.getAttribute('d'));

            path.parentNode.replaceChild(rect, path);
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

            const handleOldStyleChange = (value) => {
                this.settings.styleVersion = value ? '2021' : '2023';
                if (!value) {
                    this.settings.colorizeIcons = true;
                } else {
                    this.settings.colorizeIcons = false;
                }
                this.saveSettings();
                setOldStyle(value);
            };

            return react.createElement(
                'div',
                { className: 'settingsContainer', style: { padding: '16px' } },
                react.createElement(FormSwitch, {
                    label: 'Old Style (before 05.2021)',
                    note: 'Switch to the old elements styles before 05.2021. When enabled, colored icons are disabled.',
                    checked: oldStyle,
                    onChange: handleOldStyleChange
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
        this.processPathToRect();
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
