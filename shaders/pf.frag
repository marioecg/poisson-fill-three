precision lowp float;
  
uniform sampler2D unf;
uniform sampler2D fil;

uniform int w;
uniform int h;
uniform int pw;
uniform int ph;
uniform int pw1;
uniform int ph1;

uniform bool isup;

float h1(int i) {
    if (i == 0 || i == 4){
        return 0.1507;
    }
    
    if (i == 1 || i == 3) {
        return 0.6836;
    }
    
    return 1.0334;
}

float G(int i) {
    if (i == 0 || i == 2) {
        return 0.0312;
    }
    
    return 0.7753;
}

float round(float x) {
    return floor(x+0.5);
}
  
void main() {  
    vec2 step = 1.0 / vec2(float(w),float(h));

    int i = int((gl_FragCoord.y)+0.5);
    int j = int((gl_FragCoord.x)+0.5);
    
    if (!isup) {
        int x = (j-pw) * 2 + pw1;
        int y = (i-ph) * 2 + ph1;
        
        if (j <= pw || j >= (w-pw-1) || i <= ph || i >= (h-ph-1)){
            gl_FragColor = vec4(0.0,0.0,0.0,0.0);
            
            return;
        }
        
        vec4 acc = vec4(0.0,0.0,0.0,0.0);
        
        for (int dy = -2; dy <= 2; dy++) {
            for (int dx = -2; dx <= 2; dx++) {
                int nx = x + dx;
                int ny = y + dy;
  
                // if (nx < 0 || nx >= w || ny < 0 || ny >= h){
                //   continue;
                // }
  
                vec4 col = texture2D(unf, vec2(float(nx) * step.x, float(ny) * step.y));
  
                acc.r += h1(dx+2) * h1(dy+2) * col.r;
                acc.g += h1(dx+2) * h1(dy+2) * col.g;
                acc.b += h1(dx+2) * h1(dy+2) * col.b;
                acc.a += h1(dx+2) * h1(dy+2) * col.a;
            }
        }
        
        if (acc.a == 0.0) {
            gl_FragColor = acc;
        } else {
            gl_FragColor = vec4(acc.r/acc.a,acc.g/acc.a,acc.b/acc.a,1.0);
        }
          
    } else {
        if (j <= pw1 || j >= (w-pw1-1) || i <= ph1 || i >= (h-ph1-1)){
            gl_FragColor = vec4(0.0,0.0,0.0,0.0);
                
            return;
        }
    
        float h2 = 0.0270;
  
        vec4 acc = vec4(0.0,0.0,0.0,0.0);
    
        for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
                int nx = j + dx;
                int ny = i + dy;
    
                // if (nx < 0 || nx >= w || ny < 0 || ny >= h){
                //   continue;
                // }
    
                vec4 col = texture2D(unf, 1.0*vec2(float(nx-1) * step.x, float(ny-1) * step.y));
    
                acc.r += G(dx+1) * G(dy+1) * col.r;
                acc.g += G(dx+1) * G(dy+1) * col.g;
                acc.b += G(dx+1) * G(dy+1) * col.b;
                acc.a += G(dx+1) * G(dy+1) * col.a;
                
            }
        }
    
        for (int dy = -2; dy <= 2; dy++) {
            for (int dx = -2; dx <= 2; dx++) {
                int nx = (j + dx - pw1)/2+pw;
                int ny = (i + dy - ph1)/2+ph;
    
                // if (nx < 0 || nx >= w || ny < 0 || ny >= h){
                //   continue;
                // }
                
                vec4 col = texture2D(fil, 1.0*vec2(float(nx-1) * step.x, float(ny-1) * step.y));
    
                acc.r += h2 * h1(dx+2) * h1(dy+2) * col.r;
                acc.g += h2 * h1(dx+2) * h1(dy+2) * col.g;
                acc.b += h2 * h1(dx+2) * h1(dy+2) * col.b;
                acc.a += h2 * h1(dx+2) * h1(dy+2) * col.a;
            }
        }
    
        if (acc.a == 0.0){
            gl_FragColor = acc;
        } else {
            gl_FragColor = vec4(acc.r/acc.a,acc.g/acc.a,acc.b/acc.a,1.0);
        }
    }
}