# Anti-Gravity Decoupled Layout Rendering

      This is a technical explanation of the **Anti-Gravity** engine.
      
      
## Core Architecture

      By shifting dynamic mathematical expressions like `e^{i\pi} + 1 = 0` and heavy layout calculations to standalone worker threads, we achieve sub-millisecond document loading speeds.
      
      
### Code Reference

      
```javascript
const engine = new AntiGravityEngine({ threads: 4 });
```

      
      Refer to our [setup guide](/docs/setup) or view ![architecture diagram](/images/diagram.png) for details.