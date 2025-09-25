# Custom Background Image Instructions

## How to Add Your Custom Background Image

1. **Place your image** in this folder (`public/images/`)
2. **Supported formats**: JPG, PNG, WebP
3. **Recommended size**: 1920x1080 or larger
4. **File naming**: Use descriptive names like `homepage-background.jpg`

## Example Usage

After adding your image, update the HomePage component:

```jsx
// In src/pages/HomePage.tsx, replace this line:
backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')`,

// With your custom image:
backgroundImage: `url('/images/your-custom-image.jpg')`,
```

## Image Requirements

- **Aspect ratio**: 16:9 or 21:9 recommended
- **Resolution**: Minimum 1920x1080 for good quality
- **File size**: Keep under 2MB for fast loading
- **Content**: Travel/destination themed images work best

## Current Temporary Image

The current background uses a beautiful travel image from Unsplash as a placeholder. 