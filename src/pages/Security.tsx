import { Shield, Lock, Eye, Server, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Security Practices
          </h1>
          <p className="text-lg text-muted-foreground">
            How we protect your code and ensure secure analysis
          </p>
        </div>

        <div className="space-y-6">
          {/* Security Overview */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Our Security Commitment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">Zero Storage</span>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">GDPR Compliant</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Encryption */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Encryption & Data Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline">TLS 1.3</Badge>
                  Transport Layer Security
                </h3>
                <p className="text-sm text-muted-foreground">
                  All data transmitted between your browser and our servers is encrypted using 
                  TLS 1.3, the latest and most secure encryption protocol. This ensures that 
                  your code cannot be intercepted during transmission.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline">HTTPS Only</Badge>
                  Secure Connections
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our entire platform operates exclusively over HTTPS. We enforce strict 
                  transport security (HSTS) to prevent any downgrade attacks.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Code Processing & Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Analysis Flow:</h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">1</span>
                    <div>
                      <p className="text-sm font-medium">Client-Side Initial Processing</p>
                      <p className="text-xs text-muted-foreground">Basic validation and syntax checking happens in your browser</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">2</span>
                    <div>
                      <p className="text-sm font-medium">Memory-Only Analysis</p>
                      <p className="text-xs text-muted-foreground">Advanced analysis happens in isolated memory, never written to disk</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">3</span>
                    <div>
                      <p className="text-sm font-medium">Immediate Disposal</p>
                      <p className="text-xs text-muted-foreground">All data is purged from memory immediately after results are sent</p>
                    </div>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Access Control & Isolation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">No Human Access</p>
                    <p className="text-sm text-muted-foreground">
                      No person, including our staff, can view your code during or after analysis
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Isolated Processing</p>
                    <p className="text-sm text-muted-foreground">
                      Each analysis runs in an isolated environment, preventing cross-contamination
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Zero Third-Party Access</p>
                    <p className="text-sm text-muted-foreground">
                      We never share code with external services, APIs, or partners
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* What We DON'T Do */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                What We DON'T Do
              </CardTitle>
              <CardDescription>Transparency about our limitations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span>
                  <span>Store your code on any server or database</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span>
                  <span>Create backups or archives of submitted code</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span>
                  <span>Use your code to train AI models</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span>
                  <span>Share code with third-party services</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span>
                  <span>Log or track your code content</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">✗</span>
                  <span>Retain any identifiable information about your submission</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  GDPR Compliant
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  TLS 1.3
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Zero-Knowledge Architecture
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                We adhere to industry best practices and international privacy regulations. 
                Our zero-storage approach means we're compliant by design.
              </p>
            </CardContent>
          </Card>

          {/* Security Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations for You</CardTitle>
              <CardDescription>How to use our service securely</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Remove API keys, passwords, and secrets before analysis</li>
                <li>• Use a secure, trusted internet connection</li>
                <li>• Keep your browser updated to the latest version</li>
                <li>• Review our privacy policy for complete transparency</li>
                <li>• Contact us immediately if you suspect any security issues</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Security;
