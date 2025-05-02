# **QuickChat**

QuickChat is an app where the users can chat with others securely. It supports authentication, real-time messaging, unread message handling, user profile management, and push notifications.

##  Features

### Authentication
- Registration with phone number, name (mandatory), email/photo (optional)
- Login with phone number & password
- Field validation is ensured

### Chat Interface
- List of chats sorted with unread on top
- Real-time messaging via Socket.IO
- End-to-end encryption
- Block users
- Delete chats
- Contact discovery and invite via native SMS

### Unread Chats
- Dedicated tab showing all unread messages

### Profile Tab
- View and edit user details
- Upload profile image 
- Logout and delete account options

### Notifications
- Push notifications when new messages arrive
- Notifications active even when minimized or in other chat


## Setup Instructions

### Android steps:
1. **Launch an Android Emulator**:
    - Open Android Studio.
    - Go to AVD Manager (Android Virtual Device Manager) from the top-right corner of Android Studio or via the Tools menu.
    - Create a new virtual device or select an existing one and start it.

2. **Run the Application**:
    - Once the emulator is running, open a terminal.
    - Navigate to the project directory
    ```sh
    cd frontend
    ```
    ```sh
    npx react-native run-android
    ```

### iOS Steps:
1. **Open an iOS Simulator**:
    - Ensure you have Xcode installed in your system.
    - Open Simulator from Xcode via Xcode > Open Developer Tool > Simulator
    
2. **Install CocoaPods Dependencies**:
    - Navigate to the iOS project directory
    ```sh
    cd ios
    ```
    - Run the following command to install CocoaPods dependencies
    ```sh
    pod install
    ```

3. **Run the Application**:
   - Open a terminal
   - Navigate to the project directory after cloning
   ```sh
   cd frontend
   ```
   - Execute the following command to build and run the application
   ```sh
   npx react-native run-ios
   ```

## Tech Stack Used

- **React Native** (Mobile App)
- **Socket.IO** (Real-time communication)
- **AsyncStorage** (Local storage)
- **Axios** (API calls)
- **Push Notifications** (Device-native: Notifee)
- **React Navigation** (Routing)
- **Supabase Storage** (Profile image handling)

## Contact: 
For any issues, questions or feedback, please contact:
- Email : nikitha.medikonda@everest.engineering