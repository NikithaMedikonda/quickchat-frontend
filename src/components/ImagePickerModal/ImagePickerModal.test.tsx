import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import ImagePickerModal from './ImagePickerModal';

describe('ImagePickerModal', () => {
  it('renders the modal and shows text', () => {
    const {getByText} = render(<ImagePickerModal />);
    expect(getByText('Choose profile')).toBeTruthy();
    expect(getByText('X')).toBeTruthy();
  });

  it('renders camera and gallery images', () => {
    render(<ImagePickerModal />);
    const cameraImage = screen.getByA11yHint('camera-image');
    expect(cameraImage.props.source).toEqual({
      testUri: '../../../src/assets/camera.png',
    });
    const galleryImage = screen.getByA11yHint('gallery-image');
    expect(galleryImage.props.source).toEqual({
      testUri: '../../../src/assets/gallery.png',
    });
  });

  it('closes the modal on cancel press', () => {
    const {getByText, queryByText} = render(<ImagePickerModal />);
    const cancelButton = getByText('X');
    fireEvent.press(cancelButton);
    expect(queryByText('Choose profile')).toBeNull();
  });
});
