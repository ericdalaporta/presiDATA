path = 'c:/Users/Rafaella Gostosa/Downloads/presiDATA-main/presiDATA-main/js/compare.js'
with open(path, encoding='utf-8') as f:
    lines = f.readlines()

# Find the last line of the DOMContentLoaded that checks for compare-select-a
# We keep lines up to and including the line with '});' that follows the compare-select-a block
keep_until = None
for i, line in enumerate(lines):
    if 'compare-select-a' in line and 'DOMContentLoaded' not in line:
        # This is the if-check inside DOMContentLoaded
        # The closing }); should be 2-3 lines later
        for j in range(i, min(i+5, len(lines))):
            if lines[j].strip() == '});':
                keep_until = j + 1  # include this line
                break
        break

print(f'Total lines: {len(lines)}')
print(f'Keeping up to line: {keep_until}')
if keep_until:
    print('Last kept lines:')
    for ln in lines[max(0, keep_until-5):keep_until]:
        print(repr(ln), end='')
