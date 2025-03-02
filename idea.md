Below is an overview of one way to structure and set up your project with a Go REST backend and a TypeScript React frontend. You can use a popular Go REST framework (such as Gin) and modern React tooling to get started quickly.

---

## 1. Project Structure

Your proposed structure is a good start:

```
project-root/
├── src/
│   ├── backend/   // Go backend code
│   └── frontend/  // React (TypeScript) frontend code
```

---

## 2. Backend Setup with Go

### Choosing a Library  
For REST APIs in Go, **[Gin](https://github.com/gin-gonic/gin)** is a widely used framework due to its performance and simplicity. Other options include Echo or Fiber, but Gin is a great starting point.

### Setup Commands  
Inside your `src/backend` folder:

1. **Initialize a Go module:**
   ```bash
   cd src/backend
   go mod init github.com/yourusername/yourprojectname
   ```
2. **Install Gin:**
   ```bash
   go get -u github.com/gin-gonic/gin
   ```

### Example Code  
Create a file (e.g., `main.go`) with:
```go
package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // Simple route for testing
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "pong"})
    })

    // Listen and serve on 0.0.0.0:8080
    r.Run(":8080")
}
```
Then run your server with:
```bash
go run main.go
```

---

## 3. Frontend Setup with TypeScript React

### Creating the React App  
You can use [Create React App](https://create-react-app.dev/) with the TypeScript template or use [Vite](https://vitejs.dev/). For Create React App:

1. **Inside `src/frontend`, run:**
   ```bash
   cd src/frontend
   npx create-react-app . --template typescript
   ```

If you prefer Vite (which is faster and more minimal), try:
   ```bash
   npm create vite@latest . --template react-ts
   npm install
   ```

### CSS in TypeScript React  
There are several approaches to handling CSS in a React project:

- **Traditional CSS Files:**  
  Simply import `.css` files in your components.
  ```tsx
  import './App.css';
  ```
- **CSS Modules:**  
  Create files like `Component.module.css` to scope styles to components.
  ```tsx
  import styles from './Component.module.css';
  <div className={styles.myClass}>Hello</div>
  ```
- **Styled Components (or other CSS-in-JS libraries):**  
  Install styled-components and its TypeScript types:
  ```bash
  npm install styled-components @types/styled-components
  ```
  Then create styled components directly in your code:
  ```tsx
  import styled from 'styled-components';
  const Button = styled.button`
    background: blue;
    color: white;
  `;
  ```

---

## 4. Building and Exporting the Frontend

### Exporting as an App  
If by “export the frontend as app” you mean creating a production build that can be served as static assets, then React (via Create React App or Vite) fully supports this. Simply run:
```bash
npm run build
```
This will generate a folder (typically named `build` or `dist`) containing static HTML, CSS, and JS files. You can then:

- Serve these files with your Go backend (e.g., using Gin’s `Static` or `StaticFS` functions).
- Deploy the build folder to any static hosting service.

### Creating a Desktop or Mobile App?  
- **Desktop App:**  
  If you want to package your web app as a desktop application, consider using [Electron](https://www.electronjs.org/).
- **Mobile App:**  
  For a mobile app, you’d likely use [React Native](https://reactnative.dev/), which is similar to React but optimized for mobile platforms.

---

## 5. Summary of Setup Commands

### For the Go Backend
```bash
# In src/backend
go mod init github.com/yourusername/yourprojectname
go get -u github.com/gin-gonic/gin
# Then run your server:
go run main.go
```

### For the React Frontend (using Create React App)
```bash
# In src/frontend
npx create-react-app . --template typescript
# For CSS you can use plain CSS files, CSS modules, or styled-components
# To create a production build:
npm run build
```

Using this setup, you can develop a full-stack application with a Go REST API on the backend and a modern React frontend. React easily supports exporting as a production web app, and with additional frameworks (like Electron or React Native), you can target desktop or mobile if needed.

Feel free to ask if you need more details on any step!