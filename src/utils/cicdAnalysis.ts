// CI/CD Pipeline Analysis Module

export interface CICDIssue {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion: string;
  platform: string;
}

export interface CICDAnalysisResult {
  detected: boolean;
  platform: string | null;
  issues: CICDIssue[];
  bestPractices: { name: string; implemented: boolean; description: string }[];
  securityScore: number;
}

const CICD_PATTERNS = {
  githubActions: {
    detect: /name:\s*['"]?[\w\s-]+['"]?\s*\non:|uses:\s*actions\/|runs-on:\s*ubuntu|\.github\/workflows/i,
    name: 'GitHub Actions',
  },
  gitlabCI: {
    detect: /stages:|\.gitlab-ci\.yml|gitlab-runner|script:|before_script:|after_script:/i,
    name: 'GitLab CI',
  },
  jenkins: {
    detect: /pipeline\s*{|Jenkinsfile|agent\s*{|stages\s*{|sh\s*['"]|bat\s*['"]/i,
    name: 'Jenkins',
  },
  circleci: {
    detect: /version:\s*2|circleci|orbs:|executors:|\.circleci\/config/i,
    name: 'CircleCI',
  },
  travisci: {
    detect: /\.travis\.yml|travis_retry|travis_wait|language:\s*\w+/i,
    name: 'Travis CI',
  },
  azure: {
    detect: /azure-pipelines|trigger:|pool:|vmImage:|AzureDevOps/i,
    name: 'Azure DevOps',
  },
};

export function analyzeCICD(code: string, filename?: string): CICDAnalysisResult {
  let detectedPlatform: string | null = null;
  const issues: CICDIssue[] = [];
  const bestPractices: { name: string; implemented: boolean; description: string }[] = [];

  // Detect CI/CD platform
  for (const [key, pattern] of Object.entries(CICD_PATTERNS)) {
    if (pattern.detect.test(code)) {
      detectedPlatform = pattern.name;
      break;
    }
  }

  if (!detectedPlatform) {
    return {
      detected: false,
      platform: null,
      issues: [],
      bestPractices: [],
      securityScore: 100,
    };
  }

  // Security Checks
  
  // 1. Hardcoded secrets
  if (/password\s*[:=]\s*['"][^'"]+['"]|api[_-]?key\s*[:=]\s*['"][^'"]+['"]|secret\s*[:=]\s*['"][^'"]+['"]/i.test(code)) {
    issues.push({
      type: 'critical',
      title: 'Hardcoded Secrets in Pipeline',
      description: 'Credentials are exposed in the CI/CD configuration. These can be extracted from repository history.',
      suggestion: 'Use secrets management: GitHub Secrets (${{ secrets.MY_SECRET }}), GitLab CI Variables, or Azure Key Vault.',
      platform: detectedPlatform,
    });
  }

  // 2. Missing secret masking
  if (/echo\s*\$|print\s*\$/i.test(code) && !/::add-mask::|masked/i.test(code)) {
    issues.push({
      type: 'warning',
      title: 'Potential Secret Exposure in Logs',
      description: 'Environment variables are echoed without masking, potentially exposing secrets in build logs.',
      suggestion: 'Use secret masking: echo "::add-mask::$SECRET" for GitHub Actions, or [[ -n "$SECRET" ]] && echo "***"',
      platform: detectedPlatform,
    });
  }

  // 3. Using latest tags
  if (/uses:\s*\S+@latest|image:\s*\S+:latest/i.test(code)) {
    issues.push({
      type: 'warning',
      title: 'Using "latest" Tag for Dependencies',
      description: 'Using "latest" tags can cause unexpected build failures and security vulnerabilities.',
      suggestion: 'Pin versions: uses: actions/checkout@v4 or image: node:20.10.0 for reproducible builds.',
      platform: detectedPlatform,
    });
  }

  // 4. Missing checkout step
  if (detectedPlatform === 'GitHub Actions' && !/actions\/checkout/i.test(code)) {
    issues.push({
      type: 'warning',
      title: 'Missing Checkout Step',
      description: 'GitHub Actions workflow may not have a checkout step to fetch the code.',
      suggestion: 'Add: - uses: actions/checkout@v4 as the first step in your job.',
      platform: detectedPlatform,
    });
  }

  // 5. No caching configured
  const hasCache = /cache:|actions\/cache|restore_cache|save_cache|cacheConfig/i.test(code);
  bestPractices.push({
    name: 'Dependency Caching',
    implemented: hasCache,
    description: hasCache ? 'Dependencies are cached for faster builds' : 'Enable caching to speed up builds by 50-80%',
  });

  // 6. Parallel jobs
  const hasParallel = /parallel:|strategy:|matrix:|needs:|stages:/i.test(code);
  bestPractices.push({
    name: 'Parallel Execution',
    implemented: hasParallel,
    description: hasParallel ? 'Jobs run in parallel for faster pipelines' : 'Consider parallelizing independent jobs',
  });

  // 7. Security scanning
  const hasSecurityScan = /codeql|snyk|trivy|dependabot|security.*scan|vulnerability/i.test(code);
  bestPractices.push({
    name: 'Security Scanning',
    implemented: hasSecurityScan,
    description: hasSecurityScan ? 'Security scanning is configured' : 'Add security scanning (CodeQL, Snyk, Trivy)',
  });

  // 8. Tests in pipeline
  const hasTests = /test|jest|pytest|npm\s+test|yarn\s+test|go\s+test/i.test(code);
  bestPractices.push({
    name: 'Automated Testing',
    implemented: hasTests,
    description: hasTests ? 'Tests run automatically in the pipeline' : 'Add automated tests to catch regressions',
  });

  // 9. Branch protection / environment
  const hasEnvironment = /environment:|branches:|on:\s*\n\s*push:|pull_request:/i.test(code);
  bestPractices.push({
    name: 'Branch Rules',
    implemented: hasEnvironment,
    description: hasEnvironment ? 'Pipeline has branch/environment rules' : 'Define branch triggers and protection rules',
  });

  // 10. Artifact management
  const hasArtifacts = /artifacts:|upload-artifact|download-artifact|store_artifacts/i.test(code);
  bestPractices.push({
    name: 'Artifact Management',
    implemented: hasArtifacts,
    description: hasArtifacts ? 'Build artifacts are stored' : 'Store artifacts for debugging and deployment',
  });

  // Calculate security score
  const criticalCount = issues.filter(i => i.type === 'critical').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const implementedCount = bestPractices.filter(bp => bp.implemented).length;
  
  let securityScore = 100;
  securityScore -= criticalCount * 25;
  securityScore -= warningCount * 10;
  securityScore += (implementedCount / bestPractices.length) * 20;
  securityScore = Math.max(0, Math.min(100, securityScore));

  return {
    detected: true,
    platform: detectedPlatform,
    issues,
    bestPractices,
    securityScore: Math.round(securityScore),
  };
}
