## 1. Coding Style & Architecture

### **1.1 Clean, Modular Code**

- Every page or module should be splitted into components
- Try not to use plain html in a page and make the most code components
- keep code clean and don't create types within a page or component use the types folder instead either import or create a type from there in its correct folder (or create the correct one if not exists)
- Don't use useState or useEffect unless necessary and it's the easiest, cleanest and most modular and suitable way
- When using Redux make sure in useAppSelector to use `state` name for the argument not any other name

### **1.2 File & Folder Structure**

```
project-root/
  public/
  src/
    assets/
      icons
    components/
      admin/
        layout/
      auth/
      bordered/
      card/
      forms/
      landing/
      layout/
      loading/
      modal/
      notifications/
      preview/
      toast/
      user/
        settings/
    contexts/
      contexts/
      hooks/
      providers/
    hooks/
    old_project/ -> (Read Only Folder (Never modify or touch it just you can read it only))
    pages/
      admin/
        faculties/
        departments/
        years/
        courses/
        tasks/
      auth/
      user/
        settings/
      landing/
    services/
      apis/
        admin/
        user/
      redux/
        reducers/
      signalr/
    types/
      dtos/
      entities/
      props/
      responses/
    utils/
  README.md
  project_guidelines.md  ← (THIS FILE)
```

### **1.3 Naming Conventions**

- Variables → `camelCase`
- Constants → `camelCase`
- Functions → `camelCase`
- Classes → `PascalCase`
- Types → `PascalCase`
- Hooks → `useCamelCase`
- HookFiles → `useCamelCase`
- ComponentFiles → `PascalCase`
- CSSFiles → `PascalCase.module.css`
- Files → `PascalCase`

---

## 2. CSS & Styling Rules

### **2.1 Use CSS Variables Only**

All styling should rely on the project's CSS variables.
You'll find variables in index.css :root
If you needed a color or something not in a variable either create a variable and use it or use that plain color or hard coded value but only if it's a _one use time over the whole project_

the main css shared over the project is found in the `index.css` file in the root project folder

### **2.2 Styling Conventions**

- Use semantic class names.
- Do NOT inline style.
- Use CSS modules.

---

## 3. Transfering Rules

- When Transfering you should use the `old_project` as the src and the current `src` folder as destination
- Whenever you encounter a hardcoded value in the css you must choose the proper solution to replace it with variables instead from the index.css (you can approximate it to the nearest variable as there're some mistakes in the old project like multiple different bo shadows for elements although they should all have the same box shadow so even if it's different approxiamte it to the nearest variable in `index.css` if possible) or leave it hardcoded if a one use per whole project
- whenever you encounter an inline or internal css you must understand it to make it in the proper css module file and never use inline or internal css
- Try to format better and even refactor the code when transferring it for better readability and maintainability but with sticking to it in the final css result as it's based on the UI/UX design
- Don't use `<a>` tags instead use `Link` tags from react-router to enhance the SPA experience
- For the Imports make sure they're in this order
  -> Libraries Imports (Like react, react-router, helmet, ....)
  -> Created Components (Like Input, Select, Form, ....)
  -> Assets (Like Images or Any Assets)
  -> Styles (Like importing from css module)
- For Forms use the Zod and ReactForms approach like the one in Contact Form page of landing page
- For Page Seo don't use plain `Helmet` component in any page instead use the `PageSeo` component and fill the title, description props properly (include `CU Portal` in the title to make sure every page is under the `CU Portal` website for better SEO) and note that the title of the website is no longer `Student Portal` instead it's `CU Portal` to change it whenever encountering it
- Any Custom Select box use a component from `Select` or `SearchableInput` in case that this custom select box was searchable and that's rare to encounter
- Any Card Encountered like in pages courses or tasks or exams or announcements or etc.. use the Card component as it should be generic and cover all these cards
- When Converting and encountering any needed assets .. copy them with meaningful name to the `src/assets` proper folder whether `icons` or whatever but don't import anything from old_project directly
- Include `Layout` component in any page created so that the Layout is properly set and include the page content in the Layout
- When Handling Primary Fetch Rely on useAuthQuery with authQueryParams instead of useEffect to be cleaner and robust to long loading time of fetching user data or any network issues

---

## 4. TypeScript Conventions

- Use ES Modules (`import/export`).
- Always handle errors with `try/catch` or safe wrappers.
- use ShowToast function to show success or error for user
- Avoid `//console.log()`
- Follow functional patterns where possible.
- Avoid global state; use dedicated state management, or rely on Redux State Management that we're using and the Reducers (import them if needed)
- Every asynchronous call must be `await`ed.
- Whenever you need a new type to define avoid creating it just use the object instead like { children: React.ReactNode } unless necessary and if so, create it in its proper place in `types/...` folder
- Avoid using `interface` replace it with `type` instead
- Don't use the style of React.FC<> instead use the ({}: {}) style

---

## 5. Backend Integration

- Rely on RTK Queries in integration
- use the Queries and Mutations exported from the services/apis/ folder
- Avoid using `fetch` or `axios` under any condition
- Use `.unwrap()` for the response for any error to be caught in the try-catch block
- include any onSubmit or handle function generally between try catch block

---

## 6. Prompting Rules for AI Agents

### **These rules MUST be applied in every response, no exceptions.**

### **6.1 AI Must Always:**

- Keep code modular and clean.
- Respect the folder structure.
- Use the defined CSS variables.
- Follow naming conventions.
- Optimize readability and maintainability.
- Comment complex logic.
- Avoid redundant code.
- Keep Strictly Typing

### **6.2 AI Must Not:**

- Create inline CSS
- Use random colors not defined as variables
- Generate unstructured files
- Ignore the architecture defined above
- Create Interfaces

### **6.3 When Adding New Features**

AI must:

- Place files in the correct folder automatically
- Ensure compatibility with existing modules
- Describe the reasoning behind architecture choices

---

## 7. Commit Message Rules

Follow Conventional Commits:

```
feat: add new AC solver algorithm
fix: correct resistor snap-to-grid offset
refactor: improve node calculation engine
docs: update README
style: adjust UI colors
```

---

## 8. General Rules

- Act as a Senior Developer
- Code Less Solve More
- Try to Solve and Finish the Task in the Most Minimal Modular Way
- Make Code Seems Professional
- Remove any unneeded or unnecessary comments
- Keep Code Readable and Easy to Remember and Understand
- Keep the Final look of the Design professional, Modern and Seems like a Senior Developed it
- When Importing styles in a page/component the import styles must be the last in the import hierachy and overall the styles are the last part in import statements
