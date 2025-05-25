import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#1c1c1e',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#2c2c2e',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  okButton: {
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  cancelText: {
    color: '#fff',
    textAlign: 'center',
  },
  okText: {
    color: '#fff',
    textAlign: 'center',
  },
});
