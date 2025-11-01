import { Shield, Lock, Eye, Trash2, FileCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Our Privacy Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At AI Code Review, your privacy is our top priority. We've designed our service 
                with a privacy-first approach, ensuring your code and data remain completely secure.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="font-semibold text-green-700 dark:text-green-400">
                  🔒 Your code is NEVER stored on our servers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Handle Your Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                How We Handle Your Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Upload</h3>
                    <p className="text-sm text-muted-foreground">
                      You paste or upload your code through our secure interface
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Analyze</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI performs real-time analysis in memory (client-side processing)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Delete Immediately</h3>
                    <p className="text-sm text-muted-foreground">
                      Results are displayed to you, and all data is immediately discarded
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                What Data We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h3 className="font-semibold">We DO NOT collect:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                  <li>Your source code</li>
                  <li>Personal identifiable information</li>
                  <li>User accounts or login credentials</li>
                  <li>IP addresses (beyond temporary session management)</li>
                </ul>
              </div>

              <div className="space-y-2 mt-4">
                <h3 className="font-semibold">We DO collect (anonymously):</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                  <li>General usage statistics (e.g., number of analyses performed)</li>
                  <li>Programming language distribution (to improve support)</li>
                  <li>Performance metrics (page load times, analysis speed)</li>
                  <li>Error logs (to fix bugs and improve service)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Security Measures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security Measures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">HTTPS Encryption</p>
                    <p className="text-sm text-muted-foreground">All data transmitted is encrypted using industry-standard TLS</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Client-Side Processing</p>
                    <p className="text-sm text-muted-foreground">Primary analysis happens in your browser when possible</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">No Third-Party Sharing</p>
                    <p className="text-sm text-muted-foreground">Your code is never shared with external services or partners</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Data Retention Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We maintain a zero-retention policy for all code submissions:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Code is processed in real-time and immediately discarded</li>
                <li>• Analysis results are displayed only to you and not saved</li>
                <li>• Session data expires immediately after analysis</li>
                <li>• No backup copies or archives are created</li>
              </ul>
            </CardContent>
          </Card>

          {/* GDPR Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>GDPR & Compliance</CardTitle>
              <CardDescription>
                We comply with international privacy regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our service is designed to be GDPR-compliant by default. Since we don't store 
                personal data or code, there's no data to request, modify, or delete. We respect 
                your right to privacy and operate with full transparency.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions or Concerns?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have any questions about our privacy practices or how we handle your data, 
                please feel free to contact us. We're committed to transparency and will address 
                any concerns promptly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
