
module.exports = new Globals();
function Globals()
{
    var self = this;
    self.width = 8 * 120;
    self.colors = {
        olive: 0xA0AF99,
        brown: 0x847360,

        // olive: 0xC5C7B3,
        // brown: 0xA29380,
        

        brown2:0x9B7E5A,
        tan: 0xD9CCBA,
        white: 0xEFEEE9
    };
    self.textures = null;

    var loaded = false;
    self.load = function ()
    {
        var promise = new Promise(function (resolve, reject) {
            if (loaded) {
                return resolve();
            }
            PIXI.loader
            .add("mushroom", "images/mushroom-tile.png")
            .load(function (loader, resources) {
                console.log("Loaded:", loader, resources);
                self.textures = resources;
                resolve();
            });
        });
        return promise;
    };
}
