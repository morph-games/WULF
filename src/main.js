import config from './config/config.js';
import Game from './Game.js';

const game = new Game(config);
game.start();
window.g = game;
