# CRT script audit

Date: 2026-10-30

The Zenodo 18037445 article says the CRT threshold is not reached in the reported Taylor-Green run; the CRT term remains inactive and the near-inviscid test is future work.

The attached script uses different resolution and parameters than the PDF, uses finite-difference gradients rather than spectral derivatives, has no pressure projection to enforce incompressibility, and uses a forward-Euler update although its comment says RK4. Its binary activation also differs from the proportional threshold term described in the PDF.

No execution was performed. The published run does not demonstrate the CRT mechanism.
