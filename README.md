## ZOMBIE SLAYER

https://éamonn.ie/a4/

A game implemented in THREE.js where you fight off a zombie horde.

Probably went rather beyond the scope of the assignment, but meets all
requirements, just does a lot more than I had to. (And I found it rather
fun to do so!)

![Screenshot of title screen](/titlescreen.png)
*Title screen*
![Screenshot of gameplay](/gameplay.png)
*Gameplay*
![Screenshot of game over screen](/gameover.png)
*Game over*

Application goal: First person shooter where you try to fight off as
many zombies as possible.

Instructions: No additional instructions. Those provided on the title screen
of the game should be enough.

Challenges: I encountered numerous challenges during the creation of this program. The first and perhaps most obvious was learning how to use THREE.js. I had no previous experience with THREE.js or WebGL so this was quite hard. 

Another challenge was using THREE.js addons, as I was originally using THREE.js provided from a CDN rather than through node, and the CDN I used did not have any addons. I decided to use npm to install THREE and its addons, and used vite to build the application so I could host it on the web.

Just creating the game with all of the prerequisites installed was another challenge. I had very little experience with game development, so a lot of concepts were foreign to me. THREE.js is notably not a game engine, so I had to implement quite a few things myself, and as such they are rather primitive (e.g. very, very basic collision detection only between the player and zombies+drops)
