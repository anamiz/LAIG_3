#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float time;

void main() {

	vec2 coords = vTextureCoord.xy;
	float dist = 0.0;

	dist = distance(coords, vec2(0.5, 0.5));

	vec4 filter = vec4(0.71 - dist, 0.71 - dist, 0.71 - dist, 1.0);
	vec4 texture = texture2D(uSampler, vTextureCoord);

	gl_FragColor = texture * filter;
}