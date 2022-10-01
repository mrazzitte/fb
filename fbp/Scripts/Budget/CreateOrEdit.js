/// <reference path="~/Scripts/jquery-1.5.1.js" />

$(document).ready(function () {
    $(".clearable .clearlink").click(onClearLinkClick);

    // Set up triggers to recalculate the translated amounts
    $('select#IntervalId').change(recalculateAllRows);
    $('.entry input[name$=".Amount"]').change(recalculateAllRows);
    $('.entry select[name$=".IntervalId"]').change(recalculateAllRows);

    recalculateAllRows();
});

function onClearLinkClick() {
    $(this).parents(".clearable").find("input:text").val(null);
    $(this).parents(".clearable").find("option:selected").removeAttr("selected");
    // Add other form elements as necessary

    // Note the above code to clear the inputs does not trigger onChange() event
    recalculateAllRows();
}

function recalculateAllRows() {
    var totalIncome = 0;
    var totalExpense = 0;
    var toIntervalId = $('select#IntervalId').val();

    $('.entry').each(function () {
        try {
            var row = $(this);
            var targetAmount = row.find('.translatedamount');
            var targetInterval = row.find('.translatedinterval');

            var fromIntervalId = row.find('select[name$=".IntervalId"]').val();
            var amount = row.find('input[name$=".Amount"]').val();
            var isIncome = (row.find('input[name$=".IsIncome"]').val().toLowerCase() === 'true');

            if (amount == 0) {
                targetAmount.html('');
                targetAmount.data('amount', 0);
                targetInterval.html('');
            }
            else {
                var result = recalculateEntryEffectiveAmount(fromIntervalId, toIntervalId, amount);
                targetAmount.html('$' + (result.amount).toFixed(2));
                targetAmount.data('amount', result.amount);
                targetInterval.html('per ' + result.per);

                if (isIncome)
                    totalIncome += parseFloat(result.amount);
                else
                    totalExpense += parseFloat(result.amount);
            }
        }
        catch (e) {
            targetAmount.html('');
            targetAmount.data('amount', 0);
            targetInterval.html('');
        }
    });

    $('.entry').each(function () {
        try {
            var row = $(this);
            var targetAmount = parseFloat(row.find('.translatedamount').data('amount'));
            var isIncome = (row.find('input[name$=".IsIncome"]').val().toLowerCase() === 'true');

            if (targetAmount > 0.0001) {
                var pc;
                if (isIncome)
                    pc = targetAmount / totalIncome;
                else
                    pc = targetAmount / totalExpense;

                if (pc < 0.01)
                    row.find('.percentage').html('< 1%');
                else
                    row.find('.percentage').html((pc * 100).toFixed(0) + '%');
            }
            else {
                row.find('.percentage').html(null);
            }
        }
        catch (e) {
        }
    });

    $("#totalincome").html('$' + totalIncome.toFixed(2));

    $("#totalexpense").html('$' + totalExpense.toFixed(2));

    var surplus = totalIncome - totalExpense;

    $("#surplus").html('$' + surplus.toFixed(2));
}

function recalculateEntryEffectiveAmount(fromIntervalId, toIntervalId, amount) {
    var fromInterval = intervals[fromIntervalId];
    var toInterval = intervals[toIntervalId];
    var translatedAmount = amount / fromInterval.YearEquivalent * toInterval.YearEquivalent;
    return {
        "amount": translatedAmount,
        "per": toInterval.Abbreviation
        };

}
