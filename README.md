# Web-based Ultima-Like Framework (WULF)

The WULF project intends to create a framework based on open web technology to allow easy creation of an Ultima-like browser game. *[Started in 2018](https://github.com/lukenickerson/WULF), developed in earnest in 2025.*

## Play

* http://morph-games.github.io/WULF/dist

## Goals

## Overall Project Goals

1. (W) Web-based -- JavaScript, HTML, CSS
1. (UL) Have almost all of the features from Ultima -- See 1.0 goals below
1. (F) Customizable framework
	* FOSS
	* Limited depdencies
	* Moddable
	* Sprite-swapping

### Goals for "1.0"

1. Have most of the features from Ultima 1
	* Map on top of screen with text below it
	* Cardinal movement
	* An overworld with towns, castles, dungeons that can be entered
	* 4 Continents
	* One character, no party
	* Saving and loading
	* NPCs and monsters
	* Combat
	* Transacting with vendors
	* Shakespearean/King James English
	* Mounts - horses, ships, etc.
	* Spells
	* Inventory, with weapons, armor, spells, food, gold
	* Opening doors, coffins, chests
	* Stealing
	* Quests
	* Character creation
	* Stats advancement
	* Boss fight
	* ...and more (I have a full list written elsewhere)

1. **Exceptions** - Areas where the project will specifically *not* copy Ultima 1...
	* Dungeons will be grid-based (U6), not 1st-person (U1-5)
	* No space view (v); no space gameplay
	* Town and castle maps will be the same size sprites (U2-5), not smaller (U1)
	* Default key mapping will be different - see below
	* Legally unique - see below
	* Keep the Shakespearean English to just the NPCs (and maybe only some continents), not the UI

1. 2d, Pixel Authentic
	* Resolution of 320 x 200
	* 16x16 pixel sprites
	* No sub pixels or rotated pixels

1. Keyboard commands -- The default keys will have some changes from Ultima 1, and a few new keys.
	* ? = Show key commands
	* WASD for movement (along with arrow keys)
	* Bump combat
	* E will enter, but will also do context-appropriate things like using ladders and talking
	* F for fight - will replicate both U1's (A) attack and (F) fire depending on the range of the enemy
	* H for "hole up" (U4-5; stretch goal) instead of U1's Hyperjump
	* J for junk/drop instead of U1's (D) Drop
	* M for Map (stretch goal)
	* N for navigate (stretch goal), instead of U1's (N) Noise
	* O for Open will handle doors, coffins, and chests (U1's Open only worked on coffins)
	* P for Pickpocket replaces U1's (S) Steal
	* Q for Quicksave replace's U1's Quit and Save (which doesn't actually quit)
	* U for Use Item (matching U4-5) instead of U1's Unlock (now covered by Open)
	* V = TBD (replacing U1's view change for space)
	* Y = Yell
	* +/- for volume replaces U1's (N) Noise
	* Tab = TBD - might be the same as Ztats
	* A few renames: T for Talk instead of Transact, and I for Investigate instead of Inform.
	* All other keys should be the same as U1: Board, Cast, Get, Klimb, Look, Ready, eXit, Ztats

1. Improvements
	* More plot explanation in-game
	* Less grinding
	* No 255 overflow bugs

1. Legally Unique
	* "Ultima-like", *not "Ultima"*
	* No Lord British or Iolo (unless they want to join!)
	* New, original sprites

1. Complete within a year
	* It look Richard Garriot less than a year to build Ultima 1
	* Timing goal: Spring/Summer 2026


## Credits

- Libraries: Copied some minor utilities from LittleJS and my own RocketBoots tools.
- All other code created by Luke (a human, not an AI)
- See [LICENSE](LICENSE) for the code license
- Original custom pixel fonts are [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/)
- Original artwork and text is &copy; Copyrighted 2025

Please reach out to me on [Bluesky](https://bsky.app/profile/morph.games), or the Ultima Dragons Discord, if you: want to build a game; want to contribute to the code, art, or writing; just love the idea!; are Richard Garriot and want LB in the game; are EA and want to share the Ultima license.
