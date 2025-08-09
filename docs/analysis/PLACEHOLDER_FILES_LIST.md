# Placeholder Files List

## Files containing ${PROJECT_NAME} placeholders:

### Component Files (Need Fixing):
1. `app/dashboard/page.tsx` - Line 16: `redirect("/${PROJECT_NAME}/sign-in");`
2. `app/compare/page.tsx` - Lines 23, 33: API endpoints with placeholders

### Configuration Files (Need Fixing):
1. `deployment/nginx-site.conf` - Multiple locations with `/${PROJECT_NAME}`
2. `deployment/nginx-legal-vtc-systems.conf` - Multiple proxy locations

### Script Files (Template Processing - Keep as is):
1. `scripts/make-generic-template.sh` - Template processing script
2. `scripts/replace-project-name.py` - Template processing script
3. `scripts/create-project.sh` - Project creation script
4. `scripts/provision-infrastructure.sh` - Infrastructure provisioning

### Documentation (Keep for reference):
1. `BASEPATH_COMPARISON_REPORT.md` - Documentation of issues
2. `docs/parallel-dev/setup-worktrees.sh` - Development setup script

## Action Plan:
- Fix component files to use path utility functions
- Fix nginx configs to use generic paths
- Leave template processing scripts as they need placeholders