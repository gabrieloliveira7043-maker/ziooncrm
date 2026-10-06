import numpy as np, wave
sr=44100; dur=27.5; n=int(sr*dur); t=np.arange(n)/sr
bpm=100; beat=60/bpm
def note(f): return 440*2**((f-69)/12)
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
out=np.zeros(n)
bar=beat*4
for k in range(int(dur/bar)+1):
    c=chords[k%4]; s=int(k*bar*sr); e=min(n,int((k+1)*bar*sr)+int(.4*sr))
    if s>=n: break
    tt=np.arange(e-s)/sr
    env=np.minimum(1,tt/.6)*np.minimum(1,(bar+.4-tt)/.5)
    for m in c:
        f=note(m)
        pad=sum(np.sin(2*np.pi*f*d*tt) for d in (1,1.004,.996))*.05
        out[s:e]+=pad*env
    # bass
    out[s:e]+=np.sin(2*np.pi*note(c[0]-12)*tt)*.18*env
    # arpeggio plucks (8ths)
    for j in range(8):
        ts=int((k*bar+j*beat/2)*sr)
        if ts>=n: break
        m=c[j%3]+12; f=note(m); L=int(.35*sr); L=min(L,n-ts)
        x=np.arange(L)/sr
        out[ts:ts+L]+=np.sin(2*np.pi*f*x)*np.exp(-x*9)*.10
# kick + hat from 4s on (energy lifts)
for b in range(int(dur/beat)):
    ts=int(b*beat*sr)
    if b*beat<3.8 or ts>=n: continue
    L=min(int(.25*sr),n-ts); x=np.arange(L)/sr
    out[ts:ts+L]+=np.sin(2*np.pi*(55+90*np.exp(-x*30))*x)*np.exp(-x*14)*.45
    th=ts+int(beat*sr/2)
    if th<n:
        L=min(int(.05*sr),n-th); x=np.arange(L)/sr
        out[th:th+L]+=np.random.RandomState(b).randn(L)*np.exp(-x*80)*.05
fade=np.minimum(1,t/1.0)*np.minimum(1,(dur-t)/2.0)
out*=fade; out=out/np.abs(out).max()*.8
w=wave.open('music.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((out*32767).astype(np.int16).tobytes());w.close()
