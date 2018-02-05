const color = require('color');
const coinjson = require('./coin.json');

exports.decorateConfig = (config) => {
    const colorForeground = color(config.foregroundColor || '#fff');
    const colorBackground = color(config.backgroundColor || '#000');
    const colors = {
        foreground: colorForeground.string(),
        background: colorBackground.lighten(0.3).string()
    };

    const configColors = Object.assign({
        black: '#000000',
        red: '#ff0000',
        green: '#33ff00',
        yellow: '#ffff00',
        blue: '#0066ff',
        magenta: '#cc00ff',
        cyan: '#00ffff',
        white: '#d0d0d0',
        lightBlack: '#808080',
        lightRed: '#ff0000',
        lightGreen: '#33ff00',
        lightYellow: '#ffff00',
        lightBlue: '#0066ff',
        lightMagenta: '#cc00ff',
        lightCyan: '#00ffff',
        lightWhite: '#ffffff'
    }, config.colors);

    const hyperStatusLine = Object.assign({
        footerTransparent: true,
    }, config.hyperStatusLine);

    return Object.assign({}, config, {
        css: `
            ${config.css || ''}
            .footer_footer {
                display: flex;
                justify-content: space-between;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 100;
                font-size: 12px;
                height: 30px;
                background-color: ${colors.background};
                opacity: ${hyperStatusLine.footerTransparent ? '0.8' : '1'};
                cursor: default;
                -webkit-user-select: none;
                transition: opacity 250ms ease;
                flexShrink: '0';
            }
            .footer_footer:hover {
                opacity: 1;
            }
            .footer_footer .footer_group {
                display: flex;
                color: ${colors.foreground};
                white-space: nowrap;
                margin: 0 14px;
            }
            .footer_footer .group_overflow {
                overflow: hidden;
            }
            .footer_footer .component_component {
                display: flex;
            }
            .footer_footer .component_item {
                position: relative;
                line-height: 30px;
                margin-left: 9px;
            }
            .footer_footer .component_item:first-of-type {
                margin-left: 0;
            }
            .footer_footer .item_cwd {
                padding-left: 0px;
            }
        `
    });
};


exports.decorateHyper = (Hyper, { React }) => {
    return class extends React.PureComponent {
        constructor(props) {
            super(props);

            this.state = {
                coin: coinjson['coin'],
                coinSymbol: '',
                priceUsd: '',
                change24: '',
            }
        }

        getData() {
            return fetch('https://api.coinmarketcap.com/v1/ticker/' + this.state.coin)
              .then((response) => response.json())
              .then((responseJson) => {
                this.setState({
                  db: responseJson[0],
                  coinSymbol: responseJson[0].symbol,
                  priceUsd: responseJson[0].price_usd,
                  change24: responseJson[0].percent_change_24h
                }, function() {
                  // do something with new state
                });
              })
              .catch((error) => {
                console.error(error);
              });
        }

        render() {
            const { customChildren } = this.props
            const existingChildren = customChildren ? customChildren instanceof Array ? customChildren : [customChildren] : [];

            return (
                React.createElement(Hyper, Object.assign({}, this.props, {
                    customInnerChildren: existingChildren.concat(React.createElement('footer', { className: 'footer_footer' },
                        React.createElement('div', { className: 'footer_group group_overflow' },
                            React.createElement('div', { className: 'component_component component_cwd' },
                                React.createElement('div', { className: 'component_item item_cwd'}, this.state.coinSymbol),
                                React.createElement('div', { className: 'component_item item_cwd'}, this.state.priceUsd + "USD"),
                                React.createElement('div', { className: 'component_item item_cwd', style: {color: this.state.change24 > 0 ? 'LawnGreen' : 'red'}}, this.state.change24 + "%"),
                            )
                        ),
                    ))
                }))
            );
        }

        componentDidMount() {
            this.interval = setInterval(() => {
                this.getData();
            }, 100);
        }

        componentWillUnmount() {
            clearInterval(this.interval);
        }
    };
};
