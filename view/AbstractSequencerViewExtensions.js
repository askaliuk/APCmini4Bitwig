// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractSequencerView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);
    this.model.getCurrentTrackBank ().setIndication (true);
};

AbstractSequencerView.prototype.onScene = function (scene, event)
{
    if (!event.isDown () || !this.model.canSelectedTrackHoldNotes ())
        return;
    AbstractSequencerView.prototype.onScene (this, scene, event);
    displayNotification (this.resolutionsStr[this.selectedIndex]);
};

AbstractSequencerView.prototype.updateSceneButtons = function ()
{
    var isKeyboardEnabled = this.model.canSelectedTrackHoldNotes ();
    for (var i = 0; i < 8; i++)
        this.surface.updateButton (APC_BUTTON_SCENE_BUTTON1 + i, isKeyboardEnabled && i == (7 - this.selectedIndex) ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1, this.canScrollUp ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON2, this.canScrollDown ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON3, this.canScrollLeft ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.updateButton (APC_BUTTON_TRACK_BUTTON4, this.canScrollRight ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
};
