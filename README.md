# SiteSync Mobile App

A React Native app (using Expo) for attendance management, featuring face recognition, geolocation, and robust role-based access for supervisors and guards.

---

## Project Structure

**Key Folders and Files:**

### 1. components/
Reusable components to encapsulate major UI and device integration logic.

- **CameraLocationComponent.jsx**  
  Handles both camera and geolocation permission requests and device interaction.  
  - Requests camera and foreground location permissions.
  - Shows a permission UI if not granted.
  - Renders the camera view and a button to capture a photo.
  - Passes the captured photo to the parent via `onPictureTaken`.
  - Uses translation for all user-facing text.
  - Applies consistent styling for camera and permission prompts.

### 2. screens/
Each file here is a React component that represents a major app screen and user flow.

- **CheckInScreen.js**  
  The central screen for user check-in:
  - Integrates `CameraLocationComponent` for photo capture and location.
  - Uses `useFaceRecognition` to match user faces with backend records.
  - On a successful match, sends check-in data to the attendance service (`CheckInAttendance`).
  - Handles both authorized and unauthorized check-ins, shows alerts for the result.

- **DashboardScreen.js**  
  The main dashboard for supervisors and guards:
  - Fetches attendance and absentee data from the backend.
  - Allows supervisors to toggle between viewing attendance and absentees.
  - Displays lists with names and statuses, with role-based behavior.
  - Handles errors and loading states gracefully.
  - Provides navigation shortcuts for check-in, check-out, and login.

- **HomeScreen.js**  
  The landing page after login:
  - Shows navigation actions based on user role (supervisor or guard).
  - Provides quick access to dashboard and check-in actions.
  - Handles login status and navigation to authentication when logged out.

- **LoginScreen.js**  
  Authentication and language selection:
  - Accepts username and password, posts to the backend for authentication.
  - On success, sets user state and navigates to Home, maintaining tokens.
  - Provides clear error handling for invalid credentials or network errors.
  - Integrates with the `SwitchLanguage` component for internationalization.

### 3. navigation/
Handles top-level navigation logic using React Navigation.

- **AppNavigator.js**  
  Defines the navigation stack:
  - Configures the stack navigator with all primary screens (Login, Home, Dashboard, CheckIn).
  - Disables headers for custom styling.
  - Wraps the stack in a NavigationContainer to enable navigation across the app.

### 4. services/
Custom hooks and context providers for business logic and app-wide state.

- **UserContext.js**  
  Centralizes user authentication and authorization state:
  - Provides `CheckInfoProvider` for login state and user info.
  - Supplies helper methods for checking access, refreshing tokens, and updating user data.
  - Exposes a custom hook `useCheckInfo` for use throughout the app.

- **useAttendanceChecks.js**  
  All business logic for attendance/check-in:
  - Gets current timestamp and geolocation for attendance records.
  - Prepares and sends attendance requests (check-in, check-out, special entry) to the backend.
  - Handles photo conversion to base64, and includes location and user role in the payload.
  - Gracefully manages permissions, errors, and feedback to the calling screen.

- **useFaceRecog.js**  
  Handles all face recognition logic:
  - Sends captured photos to a face recognition API (e.g., Azure Cognitive Services).
  - Detects faces, identifies users, and fetches user data for matching.
  - Handles errors (no face found, no match, API issues) and provides user feedback.
  - Returns results for use in check-in workflows.

---

## Data Flow and Core Logic

- The user logs in and is assigned a role (supervisor or guard).
- Navigation is dynamically tailored to the role, exposing different screens and actions.
- For check-in, the app captures a photo and location, sends them for face recognition, and posts the results to the backend.
- Attendance and absentee data are fetched and displayed contextually, with supervisors having extra management views.

---

## How to Run

1. Clone the repository.
2. Install dependencies: `npm install` or `yarn`.
3. Start the Expo server: `npm start` or `yarn start`.
4. Use the Expo Go app or an emulator to run the app.

---

## Internationalization

- All UI strings use `react-i18next` for multi-language support.
- The language can be switched on the login screen.

---

## API Endpoints

- Authentication, attendance, and face recognition interact with separate backend URLs.
- Secure token handling and refresh logic are implemented in the user context.

---

## Contribution

- Components and services are modular for easy extension.
- PRs should include tests and updates to this documentation if necessary.

---

## See Also

- [Project Directory on GitHub](https://github.com/MohammedRaghib/SiteSync-Mobile-App)
- [Expo Documentation](https://docs.expo.dev/)

---

> **Note:** Some credentials (like Azure Face API keys) are placeholders and should be set in environment variables or secure config files.
