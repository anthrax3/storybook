import addons from '@storybook/addons';
// eslint-disable-next-line import/no-extraneous-dependencies
import { subscriptionsStore } from '@storybook/core/client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { forceReRender } from '@storybook/html';
import { manager } from '../base';

const channel = addons.getChannel();
const { knobStore } = manager;

function setPaneKnobs(timestamp = +new Date()) {
  channel.emit('addon:knobs:setKnobs', { knobs: knobStore.getAll(), timestamp });
}

function knobChanged(change) {
  const { name, value } = change;

  // Update the related knob and it's value.
  const knobOptions = knobStore.get(name);

  knobOptions.value = value;
  knobStore.markAllUnused();

  forceReRender();
}

function knobClicked(clicked) {
  const knobOptions = knobStore.get(clicked.name);
  knobOptions.callback();
}

function resetKnobs() {
  knobStore.reset();

  forceReRender();

  setPaneKnobs(channel, knobStore, false);
}

function disconnectCallbacks() {
  channel.removeListener('addon:knobs:knobChange', knobChanged);
  channel.removeListener('addon:knobs:knobClick', knobClicked);
  channel.removeListener('addon:knobs:reset', resetKnobs);
  knobStore.unsubscribe(setPaneKnobs);
}

function connectCallbacks() {
  channel.on('addon:knobs:knobChange', knobChanged);
  channel.on('addon:knobs:knobClick', knobClicked);
  channel.on('addon:knobs:reset', resetKnobs);
  knobStore.subscribe(setPaneKnobs);

  return disconnectCallbacks;
}

function registerKnobs() {
  subscriptionsStore.register(connectCallbacks);
}

export default registerKnobs;